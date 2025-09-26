import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile, Tenant } from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    tenant: null,
    loading: true,
    error: null,
  });

  const fetchUserData = async (user: User) => {
    try {
      console.log('🔍 Iniciando fetchUserData para user:', user.id);

      // Buscar profile do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('📋 Resultado da consulta profiles:', { profile, profileError });

      if (profileError) {
        throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
      }

      if (!profile) {
        throw new Error('Perfil não encontrado');
      }

      // Buscar dados do tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

      console.log('🏢 Resultado da consulta tenants:', { tenant, tenantError });

      if (tenantError) {
        throw new Error(`Erro ao buscar dados da ótica: ${tenantError.message}`);
      }

      if (!tenant) {
        throw new Error('Dados da ótica não encontrados');
      }

      setAuthState({
        user,
        profile,
        tenant,
        loading: false,
        error: null,
      });
      
      console.log('✅ Dados carregados com sucesso:', { user: user.id, profile, tenant });
    } catch (error: any) {
      console.error('❌ Erro em fetchUserData:', error);
      // Don't re-throw service unavailable errors to prevent cascading failures
      if (error instanceof Error && error.message.includes('temporariamente indisponível')) {
        const userData = await fetchUserData(user);
        if (userData) {
          setAuthState({
            user,
            profile: userData.profile,
            tenant: userData.tenant,
            loading: false,
            error: null,
          });
        } else {
          // Service unavailable, but user is authenticated
          console.warn('Perfil não pôde ser carregado devido a problemas de conectividade');
        }
      }
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao carregar dados do usuário',
      }));
    }
  };

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticação...');
        
        // Verificar sessão inicial
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao verificar sessão inicial:', error);
          
          // Se o refresh token não for encontrado, limpar sessão inválida
          if (error.message?.includes('refresh_token_not_found') || error.message?.includes('Invalid Refresh Token')) {
            console.log('🧹 Token de refresh inválido detectado, limpando sessão...');
            await supabase.auth.signOut();
            if (mounted) {
              setAuthState({
                user: null,
                profile: null,
                tenant: null,
                loading: false,
                error: null,
              });
            }
            return;
          }
          
          if (mounted) {
            setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('🔍 Sessão inicial encontrada, carregando dados...');
          await fetchUserData(session.user);
        } else if (mounted) {
          console.log('ℹ️ Nenhuma sessão inicial encontrada');
          setAuthState(prev => ({ ...prev, loading: false }));
        }

        // Configurar listener para mudanças futuras
        authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          
          console.log('🔄 Auth state change:', event, session?.user?.id);
          
          // Ignorar evento INITIAL_SESSION para evitar duplicação
          if (event === 'INITIAL_SESSION') {
            console.log('⏭️ Ignorando INITIAL_SESSION (já processado)');
            return;
          }
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ Login detectado, carregando dados...');
            await fetchUserData(session.user);
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 Logout detectado, limpando estado...');
            setAuthState({
              user: null,
              profile: null,
              tenant: null,
              loading: false,
              error: null,
            });
          }
        });

      } catch (error: any) {
        if (error instanceof Error && error.message.includes('temporariamente indisponível')) {
          console.warn('Serviço temporariamente indisponível:', error.message);
        } else {
          console.error('Erro na inicialização:', error);
        }
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.data?.subscription?.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...authState,
    signOut,
    refetch: () => {
      if (authState.user) {
        fetchUserData(authState.user);
      }
    },
  };
}