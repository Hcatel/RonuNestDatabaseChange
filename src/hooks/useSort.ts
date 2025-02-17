import { useState } from 'react';
import type { StorageFile } from '../types/content';

export function useSort() {
  const [sortField, setSortField] = useState<'name' | 'type' | 'size' | 'dateAdded'>('dateAdded');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortMediaFiles = (files: StorageFile[]) => {
    return [...files].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (sortField === 'size') {
        return (a.metadata.size - b.metadata.size) * direction;
      } else if (sortField === 'type') {
        return (a.metadata.mimetype || '').localeCompare(b.metadata.mimetype || '') * direction;
      } else if (sortField === 'dateAdded') {
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * direction;
      } else {
        return (a.name || '').localeCompare(b.name || '') * direction;
      }
    });
  };

  return {
    sortField,
    sortDirection,
    handleSort,
    sortMediaFiles
  };
}