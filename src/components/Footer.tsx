import React from 'react';
import { Eye, MessageCircle } from 'lucide-react';

const Footer = () => {
  const whatsappNumber = "5581988984547";
  const whatsappMessage = "Olá! Quero saber mais sobre a OpticAI";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-400 p-2 rounded-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div className="text-xl font-bold">
                <span className="text-white">Optic</span>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">AI</span>
              </div>
            </div>
            <p className="text-slate-400 max-w-md">
              A revolução em gestão e automação inteligente para óticas. 
              Transformando o modo como o mercado óptico opera.
            </p>
          </div>

          {/* Contact */}
          <div className="text-center md:text-right">
            <h3 className="text-white font-semibold mb-4">Entre em Contato</h3>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold hover:from-green-400 hover:to-green-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              <span>(81) 9 8898-4547</span>
            </a>
            <p className="text-slate-400 text-sm mt-2">
              Resposta em até 5 minutos
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 OpticAI. Todos os direitos reservados. Transformando óticas com inteligência artificial.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;