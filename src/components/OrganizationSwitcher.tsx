
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, ChevronDown } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';

export function OrganizationSwitcher() {
  const { currentOrganization, organizations, switchOrganization, loading } = useOrganization();

  if (loading || !currentOrganization) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
        <Building2 className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Carregando...</span>
      </div>
    );
  }

  if (organizations.length <= 1) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
        <Building2 className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-900">{currentOrganization.name}</span>
      </div>
    );
  }

  return (
    <Select 
      value={currentOrganization.id} 
      onValueChange={switchOrganization}
    >
      <SelectTrigger className="w-auto min-w-[200px] bg-white border-gray-200">
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-blue-600" />
          <SelectValue>
            <span className="font-medium">{currentOrganization.name}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span>{org.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
