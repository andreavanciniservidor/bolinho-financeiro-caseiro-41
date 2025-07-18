
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Organization } from '@/types';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  switchOrganization: (organizationId: string) => Promise<void>;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchOrganizations = async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    try {
      // For now, create a default organization since the organization tables don't exist yet
      // This will be replaced once the organization tables are created
      const defaultOrganization: Organization = {
        id: 'default-org',
        name: 'Minha Organização',
        slug: 'minha-organizacao',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setOrganizations([defaultOrganization]);

      // Check if user has a preferred organization in their profile
      if (profile?.current_organization_id) {
        // For now, just use the default organization
        setCurrentOrganization(defaultOrganization);
      } else {
        setCurrentOrganization(defaultOrganization);
      }

    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
      setCurrentOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = async (organizationId: string) => {
    if (!user) return;

    try {
      // Update user profile with new current organization
      const { error } = await supabase
        .from('profiles')
        .update({ current_organization_id: organizationId })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating current organization:', error);
        return;
      }

      // Update local state
      const newCurrentOrg = organizations.find(org => org.id === organizationId);
      if (newCurrentOrg) {
        setCurrentOrganization(newCurrentOrg);
      }
    } catch (error) {
      console.error('Error switching organization:', error);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [user, profile]);

  const value = {
    currentOrganization,
    organizations,
    switchOrganization,
    loading,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
