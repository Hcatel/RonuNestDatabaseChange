import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Papa from 'papaparse';

interface Profile {
  id: uuid;
  username: string;
  full_name: string | null;
  role: string;
}

export default function GroupMembers() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('id');
  const [members, setMembers] = useState<Profile[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (groupId) {
      loadMembers();
    }
  }, [groupId]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      // Get all group members
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('member_id')
        .eq('group_id', groupId);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        // Get profile information for each member
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', memberData.map(m => m.member_id));

        if (profileError) throw profileError;
        setMembers(profileData || []);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error('Error loading members:', err);
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !groupId) return;

    setIsSaving(true);
    setError(null);

    try {
      // First get the profile ID for the email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', newMemberEmail)
        .single();

      if (profileError) throw new Error('User not found with that email');

      // Then add the member to the group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          member_id: profileData.id
        });

      if (memberError) throw memberError;

      await loadMembers();
      setNewMemberEmail('');
    } catch (err) {
      console.error('Error adding member:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to add member. Make sure the email is registered.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!groupId) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('member_id', memberId);

      if (error) throw error;
      await loadMembers();
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !groupId) return;

    setIsSaving(true);
    setError(null);

    try {
      Papa.parse(file, {
        complete: async (results) => {
          const newMembers = results.data
            .slice(1) // Skip header row
            .map((row: any) => ({
              group_id: groupId,
              email: row[0],
              first_name: row[1],
              last_name: row[2],
              role: 'member'
            }))
            .filter(member => member.email);

          const { error } = await supabase
            .from('group_members')
            .insert(newMembers);

          if (error) throw error;
          await loadMembers();
        },
        header: false,
        error: (err) => {
          throw new Error(err.message);
        }
      });
    } catch (err) {
      console.error('Error importing members:', err);
      setError(err instanceof Error ? err.message : 'Failed to import members');
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="p-4 rounded-lg mb-8 bg-red-50 text-red-600">
          {error}
        </div>
      )}

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#333333]">Group Members</h2>
            <p className="text-gray-600">Add members manually or import from CSV</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-4 py-2 border border-[#ff4d00] text-[#ff4d00] rounded-lg hover:bg-[#ff4d00] hover:text-white transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvUpload}
            />
          </div>
        </div>

        {/* Add Member Form */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent"
            />
          </div>
          <div className="col-span-2 flex gap-4">
            <button
              onClick={handleAddMember}
              disabled={!newMemberEmail || isSaving}
              className="px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Add'
              )}
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="border rounded-lg divide-y">
          {members.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-gray-900">{member.full_name || 'Unnamed User'}</div>
                <div className="text-sm text-gray-600">{member.username}</div>
              </div>
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          {members.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No members added yet
            </div>
          )}
        </div>
      </section>
    </div>
  );
}