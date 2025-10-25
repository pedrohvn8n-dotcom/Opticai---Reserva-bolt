import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Calendar, CheckCircle, Circle, Edit2, Plus } from 'lucide-react';
import { supabase, Tenant } from '../lib/supabase';
import NovaOS from './NovaOS';

interface GerenciarOSProps {
  tenant: Tenant;
  onBack: () => void;
}

interface Ordem {
  id: string;
  num_os: number;
  cliente_nome: string;
  telefone_cliente: string;
  data_entrega: string | null;
  data_chegada_real: string | null;
  valor_total: number | null;
  cpf: string | null;
  endereco: string | null;
  data_nascimento: string | null;
  data_venda: string;
  forma_pagamento: string | null;
  credito_parcelas: number | null;
  status_pagamento: string | null;
  esf_od: string | null;
  cil_od: string | null;
  eixo_od: string | null;
  esf_oe: string | null;
  cil_oe: string | null;
  eixo_oe: string | null;
  adicao: string | null;
  tipo_lente: string;
  descricao_lente: string | null;
  observacao: string | null;
  descricao_pedido: string | null;
  observacao_cliente: string | null;
  dnp_od: string | null;
  dnp_oe: string | null;
  altura_od: string | null;
  altura_oe: string | null;
}

type StatusColor = 'red' | 'yellow' | 'green' | 'blue';

export default function GerenciarOS({ tenant, onBack }: GerenciarOSProps) {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [filteredOrdens, setFilteredOrdens] = useState<Ordem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'arrived' | 'not_arrived'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [editingOrdem, setEditingOrdem] = useState<Ordem | null>(null);
  const [showNovaOS, setShowNovaOS] = useState(false);

  useEffect(() => {
    fetchOrdens();
  }, [tenant.id]);

  useEffect(() => {
    filterOrdens();
  }, [ordens, searchTerm, statusFilter, dateFilter]);

  const fetchOrdens = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ordens')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('num_os', { ascending: false });

      if (error) throw error;
      setOrdens(data || []);
    } catch (error) {
      console.error('Erro ao carregar ordens:', error);
      alert('Erro ao carregar ordens de serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrdens = () => {
    let filtered = [...ordens];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ordem =>
        ordem.num_os.toString().includes(term) ||
        ordem.cliente_nome.toLowerCase().includes(term) ||
        ordem.telefone_cliente.includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ordem =>
        statusFilter === 'arrived' ? ordem.data_chegada_real !== null : ordem.data_chegada_real === null
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(ordem => ordem.data_entrega === dateFilter);
    }

    setFilteredOrdens(filtered);
  };

  const getStatusColor = (ordem: Ordem): StatusColor => {
    if (ordem.data_chegada_real) return 'green';

    if (!ordem.data_entrega) return 'blue';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entrega = new Date(ordem.data_entrega + 'T00:00:00');

    const diffDays = Math.floor((entrega.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'red';
    if (diffDays <= 1) return 'yellow';
    return 'blue';
  };

  const getStatusBorderClass = (color: StatusColor): string => {
    const classes = {
      red: 'border-l-4 border-l-red-500',
      yellow: 'border-l-4 border-l-yellow-500',
      green: 'border-l-4 border-l-green-500',
      blue: 'border-l-4 border-l-blue-500',
    };
    return classes[color];
  };

  const getStatusBgClass = (color: StatusColor): string => {
    const classes = {
      red: 'bg-red-50',
      yellow: 'bg-yellow-50',
      green: 'bg-green-50',
      blue: 'bg-blue-50',
    };
    return classes[color];
  };

  const formatPhone = (phone: string): string => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
    return phone;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const toggleArrivalStatus = async (ordem: Ordem, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const newStatus = ordem.data_chegada_real ? null : new Date().toISOString();

      const { error } = await supabase
        .from('ordens')
        .update({ data_chegada_real: newStatus })
        .eq('id', ordem.id);

      if (error) throw error;

      setOrdens(prev =>
        prev.map(o => o.id === ordem.id ? { ...o, data_chegada_real: newStatus } : o)
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status de chegada');
    }
  };

  const handleEditOrdem = (ordem: Ordem) => {
    setEditingOrdem(ordem);
  };

  const handleCloseEdit = () => {
    setEditingOrdem(null);
    fetchOrdens();
  };

  const getStatistics = () => {
    const total = ordens.length;
    const atrasadas = ordens.filter(o => getStatusColor(o) === 'red').length;
    const urgentes = ordens.filter(o => getStatusColor(o) === 'yellow').length;
    const entregues = ordens.filter(o => getStatusColor(o) === 'green').length;

    return { total, atrasadas, urgentes, entregues };
  };

  const stats = getStatistics();

  if (showNovaOS) {
    return <NovaOS tenant={tenant} onBack={() => { setShowNovaOS(false); fetchOrdens(); }} />;
  }

  if (editingOrdem) {
    return <NovaOS tenant={tenant} onBack={handleCloseEdit} editMode={true} ordemData={editingOrdem} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Ordens de Serviço</h1>
            </div>

            <button
              onClick={() => setShowNovaOS(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova OS</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">🔴 Atrasadas</div>
            <div className="text-2xl font-bold text-red-600">{stats.atrasadas}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">🟡 Urgentes</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.urgentes}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">🟢 Entregues</div>
            <div className="text-2xl font-bold text-green-600">{stats.entregues}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar por OS, Cliente, Telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="arrived">Chegou</option>
              <option value="not_arrived">Não Chegou</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrdens.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">Nenhuma ordem de serviço encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrdens.map((ordem) => {
              const statusColor = getStatusColor(ordem);
              return (
                <div
                  key={ordem.id}
                  onClick={() => handleEditOrdem(ordem)}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 ${getStatusBorderClass(statusColor)} ${getStatusBgClass(statusColor)} p-6 hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">OS #{ordem.num_os}</h3>
                        <button
                          onClick={(e) => toggleArrivalStatus(ordem, e)}
                          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border-2 transition-all hover:scale-105"
                          style={{
                            borderColor: ordem.data_chegada_real ? '#10b981' : '#d1d5db',
                            backgroundColor: ordem.data_chegada_real ? '#d1fae5' : '#ffffff',
                          }}
                        >
                          {ordem.data_chegada_real ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-green-700">Chegou</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-600">Não Chegou</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Cliente</p>
                          <p className="font-semibold text-gray-900">
                            {ordem.cliente_nome.length > 25
                              ? ordem.cliente_nome.substring(0, 25) + '...'
                              : ordem.cliente_nome}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Telefone</p>
                          <p className="font-semibold text-gray-900">{formatPhone(ordem.telefone_cliente)}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Data de Entrega</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(ordem.data_entrega) || 'Não definida'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Valor Total</p>
                          <p className="font-semibold text-gray-900">
                            {ordem.valor_total ? `R$ ${ordem.valor_total.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                          </p>
                        </div>

                        {ordem.data_chegada_real && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Data de Chegada</p>
                            <p className="font-semibold text-green-700">
                              {formatDateTime(ordem.data_chegada_real)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOrdem(ordem);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
