
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Organization, Profile } from '@/types';

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
  const { user } = useAuth();

  const fetchOrganizations = async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    try {
      // Buscar organizações do usuário
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members' as any)
        .select(`
          organizations!inner(*)
        `)
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error fetching organizations:', memberError);
        setOrganizations([]);
        setCurrentOrganization(null);
        setLoading(false);
        return;
      }

      const userOrganizations = memberData?.map((item: any) => item.organizations) || [];
      setOrganizations(userOrganizations);

      // Buscar organização atual do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles' as any)
        .select('current_organization_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        if (userOrganizations.length > 0) {
          setCurrentOrganization(userOrganizations[0]);
        }
        setLoading(false);
        return;
      }

      // Encontrar a organização atual
      const currentOrgId = profileData?.current_organization_id;
      if (currentOrgId && userOrganizations.length > 0) {
        const currentOrg = userOrganizations.find((org: any) => org.id === currentOrgId);
        setCurrentOrganization(currentOrg || userOrganizations[0] || null);
      } else if (userOrganizations.length > 0) {
        setCurrentOrganization(userOrganizations[0]);
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
      // Atualizar o perfil do usuário
      const { error } = await supabase
        .from('profiles' as any)
        .update({ current_organization_id: organizationId })
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar o estado local
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
  }, [user]);

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
