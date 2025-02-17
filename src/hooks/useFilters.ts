import { useState } from 'react';
import type { Module, Filters } from '../types/content';

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({});
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const filterModules = (modules: Module[]) => {
    return modules.filter(module => {
      let matches = true;
      
      if (filters.title) {
        matches = matches && module.title.toLowerCase().includes(filters.title.toLowerCase());
      }
      
      if (filters.visibility) {
        matches = matches && module.visibility === filters.visibility;
      }
      
      if (filters.views?.min !== undefined) {
        matches = matches && module.views >= filters.views.min;
      }
      
      if (filters.views?.max !== undefined) {
        matches = matches && module.views <= filters.views.max;
      }
      
      if (filters.date?.start) {
        matches = matches && new Date(module.created_at) >= new Date(filters.date.start);
      }
      
      if (filters.date?.end) {
        matches = matches && new Date(module.created_at) <= new Date(filters.date.end);
      }
      
      return matches;
    });
  };

  return {
    filters,
    setFilters,
    isFilterMenuOpen,
    setIsFilterMenuOpen,
    filterModules
  };
}