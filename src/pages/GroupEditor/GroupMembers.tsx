import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Papa from 'papaparse';

interface GroupMember {
  email: string;
  first_name: string;
  last_name: string;
}

export default function GroupMembers() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('id');
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newMember, setNewMember] = useState<GroupMember>({ email: '', first_name: '', last_name: '' });
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
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error loading members:', err);
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.email || !groupId) return;

    setIsSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          email: newMember.email,
          first_name: newMember.first_name,
          last_name: newMember.last_name,
          role: 'member'
        });

      if (error) throw error;

      await loadMembers();
      setNewMember({ email: '', first_name: '', last_name: '' });
    } catch (err) {
      console.error('Error adding member:', err);
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (email: string) => {
    if (!groupId) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('email', email);

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
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="text"
              value={newMember.first_name}
              onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
              placeholder="First Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              value={newMember.last_name}
              onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
              placeholder="Last Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent"
            />
            <button
              onClick={handleAddMember}
              disabled={!newMember.email || isSaving}
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
                <div className="font-medium text-gray-900">
                  {member.first_name} {member.last_name}
                </div>
                <div className="text-sm text-gray-600">{member.email}</div>
              </div>
              <button
                onClick={() => handleRemoveMember(member.email)}
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