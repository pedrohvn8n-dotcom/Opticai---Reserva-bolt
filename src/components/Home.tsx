import React from 'react';
import { LogOut, Settings, BarChart3, Users, ClipboardList, AlertTriangle, Plus, Package } from 'lucide-react';
import { supabase, Tenant } from '../lib/supabase';

interface HomeProps {
  tenant: Tenant;
  onLogout: () => void;
  onNavigateToNovaOS: () => void;
}

export default function Home({ tenant, onLogout, onNavigateToNovaOS }: HomeProps) {
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log('🚪 Iniciando logout...');
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erro no logout do Supabase:', error);
        throw error;
      }
      
      console.log('✅ Logout do Supabase realizado com sucesso');
      
      // Fechar modal imediatamente
      setShowLogoutModal(false);
      
      // Chamar callback de logout (que deve limpar o estado da aplicação)
      onLogout();
      
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, forçar o logout local
      setShowLogoutModal(false);
      onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold">
                <span className="text-gray-900">Optic</span>
                <span className="text-blue-600">AI</span>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="text-gray-600 font-medium">ERP</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Logo da Ótica */}
            {tenant.logo_url ? (
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shadow-lg">
                <img
                  src={tenant.logo_url}
                  alt={`Logo ${tenant.name}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl font-bold">
                  {tenant.name.charAt(0).toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-4xl font-bold">
                  {tenant.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Nome da Ótica */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {tenant.name}
              </h1>
              <p className="text-lg text-gray-600">
                Bem-vindo ao seu sistema de gestão inteligente
              </p>
              {tenant.endereco && (
                <p className="text-sm text-gray-500 mt-2">
                  {tenant.endereco}{tenant.numero ? `, ${tenant.numero}` : ''}
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 max-w-2xl">
              <p className="text-gray-700 leading-relaxed">
                Sua ótica agora está conectada à <strong>OpticAI</strong>. 
                Gerencie vendas, acompanhe relatórios e deixe nossos agentes de IA 
                trabalharem 24/7 para impulsionar seu negócio.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Dashboard</h3>
                <p className="text-sm text-gray-600">Relatórios e métricas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Ordens de Serviço</h3>
                    <p className="text-sm text-gray-600">Gerenciar OS</p>
                  </div>
                  <button
                    onClick={onNavigateToNovaOS}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova OS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Agentes IA</h3>
                <p className="text-sm text-gray-600">Configurar automações</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">24/7</div>
            <div className="text-sm text-gray-600">Agentes Ativos</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-gray-600">Sistema Online</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-purple-600">IA</div>
            <div className="text-sm text-gray-600">Inteligência Ativa</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600">ERP</div>
            <div className="text-sm text-gray-600">Gestão Completa</div>
          </div>
        </div>
      </main>

      {/* Modal de Confirmação de Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Confirmar Saída
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja sair do sistema? Você será redirecionado para a página inicial.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saindo...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}