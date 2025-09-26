import React from 'react';
import { Bot, MessageSquare, TrendingUp, Bell, Star, BarChart, ArrowRight } from 'lucide-react';

const AIAgents = () => {
  const whatsappNumber = "5581988984547";
  const whatsappMessage = "Quero conhecer os agentes de IA da OpticAI";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const agents = [
    {
      icon: MessageSquare,
      name: "Atendente Digital",
      problem: "Sua equipe não consegue responder todos os leads a tempo, gerando insatisfação e perda de oportunidades.",
      solution: "Responde instantaneamente perguntas frequentes e qualifica conversas iniciais. Com integração ao sistema de gestão, responde dúvidas específicas como 'meu óculos já chegou?'",
      color: "from-cyan-500 to-blue-600",
      bgColor: "from-cyan-500/10 to-blue-600/5",
      borderColor: "border-cyan-500/20"
    },
    {
      icon: TrendingUp,
      name: "Comercial OpticAI",
      problem: "Você esquece de acionar clientes já existentes, perdendo chances de venda.",
      solution: "Conecta-se proativamente, oferecendo promoções e condições especiais com base nos dados do cliente. Nunca mais perca uma oportunidade de venda.",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/5",
      borderColor: "border-green-500/20"
    },
    {
      icon: Bell,
      name: "Lembra-Visão",
      problem: "É difícil gerenciar a fidelidade do cliente. Você esquece de avisar sobre validade de receitas, retornos ou reposições.",
      solution: "Envia lembretes personalizados, felicitações de aniversário e notificações automáticas no momento certo para renovação dos óculos.",
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-500/10 to-pink-600/5",
      borderColor: "border-purple-500/20"
    },
    {
      icon: Star,
      name: "Coletor de Feedback",
      problem: "Você não sabe o que seus clientes realmente pensam sobre seu atendimento e produtos.",
      solution: "Envia pesquisas automáticas após a venda, coletando avaliações de 1 a 5 sobre qualidade, preço e atendimento.",
      color: "from-yellow-500 to-orange-600",
      bgColor: "from-yellow-500/10 to-orange-600/5",
      borderColor: "border-yellow-500/20"
    },
    {
      icon: BarChart,
      name: "Analista de Dados",
      problem: "No fim do mês, você não sabe se a ótica cresceu ou o que precisa melhorar.",
      solution: "Gera relatórios periódicos e envia direto no WhatsApp, com insights sobre vendas, feedbacks e desempenho do negócio.",
      color: "from-indigo-500 to-purple-600",
      bgColor: "from-indigo-500/10 to-purple-600/5",
      borderColor: "border-indigo-500/20"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900" id="agentes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Bot className="h-8 w-8 text-cyan-400 mr-3" />
            <span className="text-cyan-400 font-semibold text-lg">Sua Nova Equipe Digital</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              5 Agentes de IA
            </span>{' '}
            Trabalhando 24/7
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Cada agente é especializado em resolver um problema específico da sua ótica. 
            Eles atuam diretamente no WhatsApp, potencializando o negócio enquanto você dorme.
          </p>
        </div>

        {/* Agents Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            return (
              <div
                key={index}
                className={`group bg-gradient-to-br ${agent.bgColor} p-8 rounded-2xl border ${agent.borderColor} hover:transform hover:scale-105 transition-all duration-300`}
              >
                <div className="flex items-start mb-6">
                  <div className={`bg-gradient-to-r ${agent.color} w-12 h-12 rounded-xl flex items-center justify-center mr-4 group-hover:shadow-lg transition-all duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{agent.name}</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-red-400 font-semibold mb-2">❌ Problema:</h4>
                    <p className="text-slate-300 text-sm">{agent.problem}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-green-400 font-semibold mb-2">✅ Como Resolve:</h4>
                    <p className="text-slate-300 text-sm">{agent.solution}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Highlight */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8 rounded-2xl border border-slate-600 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Sua Equipe de IA Nunca Tira Férias
          </h3>
          <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
            Enquanto você dorme, nossa equipe de agentes trabalha: qualifica leads, 
            nutre relacionamentos, coleta feedbacks e gera insights para seu negócio crescer.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
          >
            <span>Contratar Minha Equipe de IA</span>
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default AIAgents;