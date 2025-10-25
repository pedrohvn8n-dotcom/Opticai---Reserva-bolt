import React, { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginModal from './components/LoginModal';
import Home from './components/Home';
import { 
  Eye, 
  Bot, 
  BarChart3, 
  MessageCircle, 
  Calendar, 
  Star, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Loader2
} from 'lucide-react';

function App() {
  const { user, profile, tenant, loading, error } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'nova-os' | 'gerenciar-os'>('home');
  const [isVisible, setIsVisible] = useState({
    hero: true,
    problema: true,
    recursos: true,
    agentes: true,
    'cta-final': true
  });

  useEffect(() => {
    // Garantir que todas as seções sejam visíveis após um pequeno delay
    const timer = setTimeout(() => {
      setIsVisible({
        hero: true,
        problema: true,
        recursos: true,
        agentes: true,
        'cta-final': true
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Links específicos para cada CTA
  const whatsappLinks = {
    geral: "https://wa.me/5581988984547?text=Ol%C3%A1!%20Quero%20conhecer%20a%20OpticAI%20e%20saber%20como%20ela%20pode%20transformar%20minha%20%C3%B3tica",
    comecar: "https://wa.me/5581988984547?text=Quero%20come%C3%A7ar%20a%20usar%20a%20OpticAI%20na%20minha%20%C3%B3tica%20agora!",
    sistema: "https://wa.me/5581988984547?text=Quero%20ver%20o%20sistema%20de%20gest%C3%A3o%20da%20OpticAI%20funcionando",
    agentes: "https://wa.me/5581988984547?text=Quero%20ativar%20os%20agentes%20de%20IA%20na%20minha%20%C3%B3tica",
    resolver: "https://wa.me/5581988984547?text=Quero%20resolver%20os%20problemas%20de%20gest%C3%A3o%20da%20minha%20%C3%B3tica%20com%20a%20OpticAI",
    transformacao: "https://wa.me/5581988984547?text=Estou%20pronto%20para%20transformar%20minha%20%C3%B3tica%20com%20a%20OpticAI!"
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Carregando OpticAI...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-4">Erro de Autenticação</h2>
            <p className="text-slate-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-all duration-300"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated and has tenant data, show ERP
  if (user && profile && tenant) {
    if (currentPage === 'nova-os') {
      const NovaOS = React.lazy(() => import('./components/NovaOS'));
      return (
        <React.Suspense fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        }>
          <NovaOS
            tenant={tenant}
            onBack={() => setCurrentPage('home')}
          />
        </React.Suspense>
      );
    }

    if (currentPage === 'gerenciar-os') {
      const GerenciarOS = React.lazy(() => import('./components/GerenciarOS'));
      return (
        <React.Suspense fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        }>
          <GerenciarOS
            tenant={tenant}
            onBack={() => setCurrentPage('home')}
          />
        </React.Suspense>
      );
    }

    return (
      <Home
        tenant={tenant}
        onLogout={() => {
          console.log('🔄 Callback de logout chamado, recarregando página...');
          // Forçar recarga completa da página para limpar todo o estado
          window.location.reload();
        }}
        onNavigateToNovaOS={() => setCurrentPage('nova-os')}
        onNavigateToGerenciarOS={() => setCurrentPage('gerenciar-os')}
      />
    );
  }

  const problems = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      problem: "Sua equipe não consegue responder todos os leads a tempo",
      solution: "Atendente Digital",
      description: "Responde instantaneamente perguntas frequentes e qualifica conversas. Integrado ao sistema, resolve dúvidas como 'meu óculos já chegou?'"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      problem: "Você esquece de acionar clientes existentes",
      solution: "Comercial OpticAI",
      description: "Conecta-se proativamente com clientes, oferecendo promoções e condições especiais baseadas no histórico de compras."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      problem: "É difícil gerenciar a fidelidade do cliente",
      solution: "Lembra-Visão",
      description: "Lembretes automáticos sobre validade de receitas, retornos, reposições e felicitações personalizadas."
    },
    {
      icon: <Star className="w-8 h-8" />,
      problem: "Você não sabe o que seus clientes pensam",
      solution: "Coletor de Feedback",
      description: "Pesquisas automáticas pós-venda, coletando avaliações sobre qualidade, preço e atendimento."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      problem: "No fim do mês, você não sabe se cresceu",
      solution: "Analista de Dados",
      description: "Relatórios periódicos automáticos no WhatsApp com insights sobre vendas, feedbacks e performance."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-blue-500/20">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/logo_opticai.png" alt="OpticAI Logo" className="w-12 h-8" />
              <span className="text-2xl font-bold">
                <span className="text-white">Optic</span>
                <span className="text-cyan-400">AI</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#recursos" className="hover:text-cyan-400 transition-colors">Recursos</a>
                <a href="#agentes" className="hover:text-cyan-400 transition-colors">Agentes IA</a>
                <a href="#contato" className="hover:text-cyan-400 transition-colors">Contato</a>
              </div>

              {/* Login Button - Always visible */}
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 text-sm"
              >
                Login
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-blue-500/20">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#recursos" className="hover:text-cyan-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Recursos</a>
                <a href="#agentes" className="hover:text-cyan-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Agentes IA</a>
                <a href="#contato" className="hover:text-cyan-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Contato</a>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-24 px-6 min-h-screen flex items-center">
        <div className="container mx-auto text-center max-w-4xl w-full">
          <div className={`transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-8">
              <span className="inline-block bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-full px-4 py-2 text-sm mb-6">
                🚀 Revolução em Gestão Inteligente
              </span>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Transforme sua ótica com 
                <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Inteligência Artificial</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                <strong>A OpticAI não é apenas um software.</strong> É uma equipe de agentes de IA trabalhando 24/7 no seu WhatsApp, 
                com sistema de gestão completo para alavancar vendas e automatizar sua ótica.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <a 
                href={whatsappLinks.comecar}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center space-x-2 min-w-[200px]"
              >
                <span>Começar Agora</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <a 
                href="#recursos"
                className="px-10 py-4 border-2 border-cyan-400/30 rounded-full font-semibold text-lg hover:border-cyan-400 transition-all duration-300 hover:bg-cyan-400/10 flex items-center justify-center min-w-[200px]"
              >
                Ver Como Funciona
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problema" className="py-20 px-6 bg-slate-800/50">
        <div className="container mx-auto max-w-4xl text-center">
          <div className={`transition-all duration-1000 ${isVisible.problema ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              A gestão da sua ótica é um <span className="text-red-400">caos</span>?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-red-400 mb-4">😫 Informações Perdidas</h3>
                <p className="text-slate-300">Você gasta horas procurando dados de vendas e não tem clareza do faturamento</p>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-red-400 mb-4">📞 Leads Perdidos</h3>
                <p className="text-slate-300">Sua equipe não consegue responder todos os clientes a tempo</p>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-red-400 mb-4">❓ Clientes Insatisfeitos</h3>
                <p className="text-slate-300">Você não sabe o que seus clientes realmente pensam do seu serviço</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-2xl p-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-cyan-400">
                A OpticAI resolve tudo isso para você!
              </h3>
              <p className="text-lg text-slate-300 mb-6">
                Centralize todo o controle da sua ótica em um só lugar com nosso ERP inteligente. 
                Ao mesmo tempo, impulsione suas vendas e automatize a comunicação com agentes de IA dedicados.
              </p>
              
              <a 
                href={whatsappLinks.resolver}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-all duration-300"
              >
                <span>Quero Resolver Isso Agora</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sistema de Gestão */}
      <section id="recursos" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className={`transition-all duration-1000 ${isVisible.recursos ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Sistema de Gestão <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Inteligente</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                O centro de controle da sua ótica. Visualize tudo que importa em um dashboard simples e intuitivo.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600/30 rounded-xl p-6 hover:scale-105 transition-all duration-300">
                <BarChart3 className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold mb-4">Dashboard de Vendas</h3>
                <p className="text-slate-300">Relatórios visuais em tempo real. Veja faturamento e produtos mais vendidos.</p>
              </div>
              
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600/30 rounded-xl p-6 hover:scale-105 transition-all duration-300">
                <CheckCircle className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold mb-4">Ordens de Serviço</h3>
                <p className="text-slate-300">Registre OS de forma rápida e prática. Acompanhe o status de cada pedido automaticamente.</p>
              </div>
              
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600/30 rounded-xl p-6 hover:scale-105 transition-all duration-300">
                <Star className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold mb-4">Análise de Feedback</h3>
                <p className="text-slate-300">Colete e analise feedbacks automaticamente. Tome decisões baseadas em dados reais dos clientes.</p>
              </div>
            </div>

            <div className="text-center">
              <a 
                href={whatsappLinks.sistema}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
              >
                <span>Ver Sistema Funcionando</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Agentes de IA */}
      <section id="agentes" className="py-20 px-6 bg-slate-800/50">
        <div className="container mx-auto max-w-6xl">
          <div className={`transition-all duration-1000 ${isVisible.agentes ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Sua Nova <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Equipe Digital</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                5 agentes de IA especializados trabalhando 24/7 no WhatsApp da sua ótica. 
                Cada um com uma missão específica para impulsionar seu negócio.
              </p>
            </div>

            <div className="space-y-12">
              {problems.map((item, index) => (
                <div key={index} className="group">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                      <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-6 mb-6">
                        <h4 className="text-lg font-semibold text-red-400 mb-2">❌ Problema:</h4>
                        <p className="text-slate-300">{item.problem}</p>
                      </div>
                    </div>
                    
                    <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                      <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-8 hover:scale-105 transition-all duration-300">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg">
                            {item.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-cyan-400">{item.solution}</h3>
                        </div>
                        <p className="text-slate-300 text-lg leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-2xl p-8 mb-8">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  🤖 Todos os agentes trabalham integrados ao seu sistema
                </h3>
                <p className="text-lg text-slate-300 mb-6">
                  Informações em tempo real, respostas precisas e ações automatizadas. 
                  É como ter uma equipe especializada que nunca dorme e não comete erros.
                </p>
              </div>
              
              <a 
                href={whatsappLinks.agentes}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
              >
                <Bot className="w-6 h-6" />
                <span>Ativar Minha Equipe de IA</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section id="cta-final" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className={`transition-all duration-1000 ${isVisible['cta-final'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-3xl p-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Pronto para <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">revolucionar</span> sua ótica?
              </h2>
              
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Junte-se aos donos de óticas que já descobriram como aumentar vendas, 
                reduzir custos e oferecer atendimento de excelência com a OpticAI.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Fale Conosco</h4>
                  <p className="text-slate-400 text-center">Clique no botão e nos conte sobre sua ótica</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Configuração</h4>
                  <p className="text-slate-400 text-center">Rápida implementação</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Resultados</h4>
                  <p className="text-slate-400 text-center">Veja suas vendas decolarem automaticamente</p>
                </div>
              </div>

              <a 
                href={whatsappLinks.transformacao}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25"
              >
                <span>Começar Transformação Agora</span>
                <ArrowRight className="w-6 h-6" />
              </a>

              <p className="text-sm text-slate-400 mt-4">
                ⚡ Resposta imediata • 🚀 Configuração rápida • 💼 Sem compromisso inicial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-slate-900/90 border-t border-slate-700 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <img src="/logo_opticai.png" alt="OpticAI Logo" className="w-12 h-8" />
                <span className="text-2xl font-bold">
                  <span className="text-white">Optic</span>
                  <span className="text-cyan-400">AI</span>
                </span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Revolucionando a gestão de óticas com inteligência artificial. 
                Automatize processos, aumente vendas e ofereça atendimento excepcional.
              </p>
              <div className="flex space-x-4">
                <a 
                  href={whatsappLinks.geral}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-full hover:scale-110 transition-transform"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Recursos</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#recursos" className="hover:text-cyan-400 transition-colors">Sistema de Gestão</a></li>
                <li><a href="#agentes" className="hover:text-cyan-400 transition-colors">Agentes de IA</a></li>
                <li>Dashboard Inteligente</li>
                <li>Automação WhatsApp</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Contato</h5>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>(81) 98898-4547</span>
                </li>
                <li>Atendimento 24/7</li>
                <li>Suporte Especializado</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 OpticAI. Todos os direitos reservados. Transformando óticas com inteligência artificial.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoginModalOpen(false);
        }}
      />
    </div>
  );
}

export default App;