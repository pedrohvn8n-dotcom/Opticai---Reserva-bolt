import React from 'react';
import { BarChart3, FileText, Users, ArrowRight } from 'lucide-react';

const ManagementSystem = () => {
  const whatsappNumber = "5581988984547";
  const whatsappMessage = "Quero conhecer o sistema de gestão da OpticAI";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const features = [
    {
      icon: BarChart3,
      title: "Dashboard Inteligente",
      description: "Visualize relatórios de vendas em um dashboard simples e intuitivo. Dados em tempo real para decisões rápidas e assertivas."
    },
    {
      icon: FileText,
      title: "Ordens de Serviço",
      description: "Registre e gerencie ordens de serviço de forma rápida e prática. Acompanhe status e prazos automaticamente."
    },
    {
      icon: Users,
      title: "Análise de Feedback",
      description: "Analise feedbacks de clientes e tome decisões baseadas em dados. Entenda o que seus clientes realmente pensam."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800" id="gestao">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Sistema de Gestão
            </span>{' '}
            Inteligente
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            O centro de controle da sua ótica. Tenha clareza total sobre vendas, 
            operações e satisfação dos clientes em um só lugar.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Highlight Box */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 p-8 rounded-2xl border border-cyan-500/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Centralize Todo o Controle da Sua Ótica
          </h3>
          <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
            Com o ERP inteligente da OpticAI, você tem visibilidade completa do seu negócio. 
            Dashboards claros, relatórios automáticos e insights baseados em dados para decisões mais assertivas.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
          >
            <span>Ver Sistema em Funcionamento</span>
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ManagementSystem;