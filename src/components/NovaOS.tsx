import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, Download } from 'lucide-react';
import { supabase, Tenant } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface NovaOSProps {
  tenant: Tenant;
  onBack: () => void;
}

interface FormData {
  cliente_nome: string;
  telefone_cliente: string;
  cpf: string;
  endereco: string;
  data_nascimento: string;
  data_venda: string;
  data_entrega: string;
  valor_total: string;
  forma_pagamento: string;
  credito_parcelas: string;
  esf_od: string;
  cil_od: string;
  eixo_od: string;
  esf_oe: string;
  cil_oe: string;
  eixo_oe: string;
  adicao: string;
  tipo_lente: string;
  descricao_lente: string;
  observacao: string;
  descricao_pedido: string;
  observacao_cliente: string;
  dnp_od: string;
  dnp_oe: string;
  altura_od: string;
  altura_oe: string;
}

export default function NovaOS({ tenant, onBack }: NovaOSProps) {
  const [formData, setFormData] = useState<FormData>({
    cliente_nome: '',
    telefone_cliente: '',
    cpf: '',
    endereco: '',
    data_nascimento: '',
    data_venda: new Date().toISOString().split('T')[0],
    data_entrega: '',
    valor_total: '',
    forma_pagamento: 'dinheiro',
    credito_parcelas: '',
    esf_od: '',
    cil_od: '',
    eixo_od: '',
    esf_oe: '',
    cil_oe: '',
    eixo_oe: '',
    adicao: '',
    tipo_lente: 'Visão Simples',
    descricao_lente: '',
    observacao: '',
    descricao_pedido: '',
    observacao_cliente: '',
    dnp_od: '',
    dnp_oe: '',
    altura_od: '',
    altura_oe: '',
  });

  const [nextNumOS, setNextNumOS] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchNextNumOS();
  }, []);

  const fetchNextNumOS = async () => {
    try {
      const { data, error } = await supabase
        .from('ordens')
        .select('num_os')
        .eq('tenant_id', tenant.id)
        .order('num_os', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      const nextNum = data && data.length > 0 ? data[0].num_os + 1 : 1;
      setNextNumOS(nextNum);
    } catch (error) {
      console.error('Erro ao buscar próximo número da OS:', error);
      setNextNumOS(1);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumOSChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    setNextNumOS(numValue);
  };

  // Função para converter imagem para base64
  const getImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Erro ao carregar logo:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!formData.cliente_nome.trim() || !formData.telefone_cliente.trim() || !formData.tipo_lente) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSaving(true);

    try {
      const orderData = {
        tenant_id: tenant.id,
        num_os: nextNumOS,
        cliente_nome: formData.cliente_nome,
        telefone_cliente: formData.telefone_cliente,
        cpf: formData.cpf || null,
        endereco: formData.endereco || null,
        data_nascimento: formData.data_nascimento || null,
        data_venda: formData.data_venda || null,
        data_entrega: formData.data_entrega || null,
        valor_total: formData.valor_total ? parseFloat(formData.valor_total) : null,
        forma_pagamento: formData.forma_pagamento || null,
        credito_parcelas: formData.credito_parcelas ? parseInt(formData.credito_parcelas) : null,
        esf_od: formData.esf_od || null,
        cil_od: formData.cil_od || null,
        eixo_od: formData.eixo_od || null,
        esf_oe: formData.esf_oe || null,
        cil_oe: formData.cil_oe || null,
        eixo_oe: formData.eixo_oe || null,
        adicao: formData.adicao || null,
        tipo_lente: formData.tipo_lente,
        descricao_lente: formData.descricao_lente || null,
        observacao: formData.observacao || null,
        descricao_pedido: formData.descricao_pedido || null,
        observacao_cliente: formData.observacao_cliente || null,
        dnp_od: formData.dnp_od || null,
        dnp_oe: formData.dnp_oe || null,
        altura_od: formData.altura_od || null,
        altura_oe: formData.altura_oe || null,
      };

      const { data, error } = await supabase
        .from('ordens')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      alert(`OS #${data.num_os} salva com sucesso!`);
      onBack();
    } catch (error: any) {
      console.error('Erro ao salvar OS:', error);
      alert(`Erro ao salvar OS: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = async (type: 'laboratorio' | 'venda') => {
    try {
      // Criar PDF com dimensões A6 paisagem
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [148, 105]
      });
      
      const pageWidth = 148;
      const pageHeight = 105;
      const margin = 6;
      let currentY = margin;
      
      // Título
      const title = type === 'laboratorio' ? 'REMESSA DO LABORATÓRIO' : 'REMESSA DE VENDA';
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pageWidth / 2, currentY + 3, { align: 'center' });
      currentY += 8;
      
      // Cabeçalho com logo e informações da ótica
      const logoSize = 12;
      let logoX = margin;
      
      // Tentar carregar logo
      if (tenant.logo_url) {
        try {
          const logoBase64 = await getImageAsBase64(tenant.logo_url);
          if (logoBase64) {
            pdf.addImage(logoBase64, 'JPEG', logoX, currentY, logoSize, logoSize);
          } else {
            // Fallback: desenhar placeholder
            pdf.setFillColor(37, 99, 235);
            pdf.rect(logoX, currentY, logoSize, logoSize, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text(tenant.name.charAt(0).toUpperCase(), logoX + logoSize/2, currentY + logoSize/2 + 2, { align: 'center' });
            pdf.setTextColor(0, 0, 0);
          }
        } catch (error) {
          // Fallback: desenhar placeholder
          pdf.setFillColor(37, 99, 235);
          pdf.rect(logoX, currentY, logoSize, logoSize, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(tenant.name.charAt(0).toUpperCase(), logoX + logoSize/2, currentY + logoSize/2 + 2, { align: 'center' });
          pdf.setTextColor(0, 0, 0);
        }
      } else {
        // Placeholder para logo
        pdf.setFillColor(37, 99, 235);
        pdf.rect(logoX, currentY, logoSize, logoSize, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(tenant.name.charAt(0).toUpperCase(), logoX + logoSize/2, currentY + logoSize/2 + 2, { align: 'center' });
        pdf.setTextColor(0, 0, 0);
      }
      
      // Informações da ótica
      const infoX = logoX + logoSize + 4;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      const tenantName = tenant.name.length > 25 ? tenant.name.substring(0, 25) + '...' : tenant.name;
      pdf.text(tenantName, infoX, currentY + 3);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const endereco = tenant.endereco ? 
        `${tenant.endereco}${tenant.numero ? `, ${tenant.numero}` : ''}` : 
        'Endereço não informado';
      const enderecoTruncated = endereco.length > 40 ? endereco.substring(0, 40) + '...' : endereco;
      pdf.text(enderecoTruncated, infoX, currentY + 6);
      pdf.text('Tel: (81) 98898-4547', infoX, currentY + 9);
      
      // N° OS com título alinhado com o nome da ótica
      const osBoxWidth = 20;
      const osBoxHeight = 10;
      const osBoxX = pageWidth - margin - osBoxWidth;
      const osBoxY = currentY; // Posicionar na mesma altura do nome da ótica

      // Título "N° OS" alinhado com o nome da ótica
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('N° OS', osBoxX + osBoxWidth/2, currentY + 2, { align: 'center' });
      
      // Caixa do número da OS
      pdf.setDrawColor(209, 213, 219);
      pdf.setFillColor(249, 250, 251);
      pdf.rect(osBoxX, osBoxY, osBoxWidth, osBoxHeight, 'FD');
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text(nextNumOS.toString(), osBoxX + osBoxWidth/2, osBoxY + 6.5, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      
      currentY += 18; // Espaço após logo/N° OS (bloco 1)
      
      // Função para formatar data no padrão brasileiro
      const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Função para formatar telefone
      const formatPhone = (phone: string): string => {
        if (!phone) return '';
        // Remove todos os caracteres não numéricos
        const numbers = phone.replace(/\D/g, '');
        // Formato: (XX) X XXXX-XXXX
        if (numbers.length === 11) {
          return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        }
        // Formato: (XX) XXXX-XXXX para números com 10 dígitos
        if (numbers.length === 10) {
          return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
        }
        return phone; // Retorna original se não conseguir formatar
      };

      // Datas na mesma linha com underline apenas nos valores
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Data de Venda
      const dataVendaLabel = 'Data de Venda: ';
      const dataVendaValue = formatDate(formData.data_venda) || '';
      pdf.text(dataVendaLabel, margin, currentY);
      const labelWidth = pdf.getTextWidth(dataVendaLabel);
      
      // Valor da data com fonte maior
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(dataVendaValue, margin + labelWidth + 2, currentY); // +2mm de espaço padronizado
      const valueWidth = pdf.getTextWidth(dataVendaValue);
      // Linha apenas no valor
      const dataVendaLineWidth = Math.max(valueWidth + 2, 25);
      pdf.line(margin + labelWidth + 2, currentY + 1, margin + labelWidth + 2 + dataVendaLineWidth, currentY + 1);
      
      // Data de Entrega (lado direito)
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const dataEntregaLabel = 'Data de Entrega: ';
      const dataEntregaValue = formatDate(formData.data_entrega) || '';
      const dataEntregaLabelWidth = pdf.getTextWidth(dataEntregaLabel);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      const dataEntregaValueWidth = pdf.getTextWidth(dataEntregaValue);
      const dataEntregaLineWidth = Math.max(dataEntregaValueWidth + 2, 25);
      const totalEntregaWidth = dataEntregaLabelWidth + 2 + dataEntregaLineWidth; // +2mm de espaço padronizado
      const dataEntregaX = pageWidth - margin - totalEntregaWidth;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(dataEntregaLabel, dataEntregaX, currentY);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(dataEntregaValue, dataEntregaX + dataEntregaLabelWidth + 2, currentY); // +2mm de espaço padronizado
      // Linha apenas no valor
      pdf.line(dataEntregaX + dataEntregaLabelWidth + 2, currentY + 1, dataEntregaX + dataEntregaLabelWidth + 2 + dataEntregaLineWidth, currentY + 1);
      
      currentY += 10; // Espaço após datas (bloco 2)
      
      if (type === 'laboratorio') {
        // Nome e Telefone na mesma linha
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        // Nome
        const nomeLabel = 'Nome: ';
        const clienteNome = formData.cliente_nome.length > 25 ? formData.cliente_nome.substring(0, 25) + '...' : formData.cliente_nome;
        const nomeLabelWidth = pdf.getTextWidth(nomeLabel);
        
        pdf.text(nomeLabel, margin, currentY);
        
        // Valor do nome com fonte maior
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(clienteNome, margin + nomeLabelWidth + 2, currentY); // Espaço padronizado como no campo Nome
        const nomeValueWidth = pdf.getTextWidth(clienteNome);
        const nomeAreaWidth = (pageWidth - 2 * margin) * 0.60;
        // Linha apenas no valor
        pdf.line(margin + nomeLabelWidth + 2, currentY + 1, margin + nomeLabelWidth + 2 + Math.max(nomeValueWidth, nomeAreaWidth - nomeLabelWidth - 2), currentY + 1);
        
        // Telefone com espaçamento padronizado (ajustado para mesmo padrão)
        const telefoneLabel = 'Telefone: ';
        const telefoneValue = formatPhone(formData.telefone_cliente) || '';
        const telefoneLabelWidth = pdf.getTextWidth(telefoneLabel);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const telefoneValueWidth = pdf.getTextWidth(telefoneValue);
        const telefoneLineWidth = Math.max(telefoneValueWidth + 2, 30);
        
        // Manter telefone alinhado com Data de Entrega
        const telefoneX = dataEntregaX;
        
        pdf.text(telefoneLabel, telefoneX, currentY);
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(telefoneValue, telefoneX + telefoneLabelWidth + 2, currentY); // Espaço padrão de +2mm
        // Linha apenas no valor
        pdf.line(telefoneX + telefoneLabelWidth + 2, currentY + 1, telefoneX + telefoneLabelWidth + 2 + telefoneLineWidth, currentY + 1);
        
        currentY += 8; // Espaço após nome/telefone (bloco 3)
        
        // Tabela de graus usando autoTable (mais larga)
        const grausData = [
          ['OD', formData.esf_od || '', formData.cil_od || '', formData.eixo_od || '', formData.dnp_od || '', formData.altura_od || ''],
          ['OE', formData.esf_oe || '', formData.cil_oe || '', formData.eixo_oe || '', formData.dnp_oe || '', formData.altura_oe || '']
        ];
        
        autoTable(pdf, {
          startY: currentY,
          head: [['', 'Esférico', 'Cilíndrico', 'Eixo', 'DNP', 'Altura']],
          body: grausData,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 2,
            halign: 'center',
            valign: 'middle',
            lineColor: [209, 213, 219],
            lineWidth: 0.5
          },
          headStyles: {
            fillColor: [249, 250, 251],
            textColor: [55, 65, 81],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { fillColor: [249, 250, 251], fontStyle: 'bold', cellWidth: 15 },
            1: { cellWidth: 24 },
            2: { cellWidth: 24 },
            3: { cellWidth: 22 },
            4: { cellWidth: 22 },
            5: { cellWidth: 22 }
          },
          tableWidth: dataEntregaX + dataEntregaLabelWidth + 2 + dataEntregaLineWidth - margin,
          margin: { left: margin, right: margin }
        });
        
        currentY = pdf.lastAutoTable.finalY + 3;
        
        // Tipo de lente, descrição e adição na mesma linha
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        // Tipo de Lente (30% da largura)
        const tipoWidth = (pageWidth - 2 * margin) * 0.3;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tipo de Lente', margin, currentY);
        currentY += 3;
        
        // Radio buttons para tipo de lente
        const radioSize = 3;
        pdf.setDrawColor(37, 99, 235);
        pdf.setFillColor(formData.tipo_lente === 'Visão Simples' ? 37 : 255, formData.tipo_lente === 'Visão Simples' ? 99 : 255, formData.tipo_lente === 'Visão Simples' ? 235 : 255);
        pdf.circle(margin + 2, currentY + 1, radioSize/2, 'FD');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Visão Simples', margin + 6, currentY + 2);
        
        pdf.setFillColor(formData.tipo_lente === 'Multifocal' ? 37 : 255, formData.tipo_lente === 'Multifocal' ? 99 : 255, formData.tipo_lente === 'Multifocal' ? 235 : 255);
        pdf.circle(margin + 2, currentY + 4, radioSize/2, 'FD');
        pdf.text('Multifocal', margin + 6, currentY + 5);
        
        // Descrição da lente (50% da largura, fonte maior)
        const descricaoX = margin + tipoWidth + 5;
        const descricaoWidth = (pageWidth - 2 * margin) * 0.5;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const descricaoLente = formData.descricao_lente || '';
        pdf.text(descricaoLente, descricaoX, currentY - 3);
        pdf.line(descricaoX, currentY - 2, descricaoX + descricaoWidth, currentY - 2);
        
        // Adição (se multifocal)
        if (formData.tipo_lente === 'Multifocal') {
          const adicaoX = descricaoX + descricaoWidth + 5;
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Adição', adicaoX, currentY - 6);
          pdf.setFont('helvetica', 'normal');
          pdf.text(formData.adicao || '', adicaoX, currentY - 3);
          const adicaoWidth = pageWidth - margin - adicaoX;
          pdf.line(adicaoX, currentY - 2, adicaoX + adicaoWidth, currentY - 2);
        }
        
        currentY += 5;
        
        // Observação com underline
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const obsText = `Obs.: ${formData.observacao || ''}`;
        pdf.text(obsText, margin, currentY);
        const obsWidth = pageWidth - 2 * margin;
        pdf.line(margin, currentY + 1, margin + obsWidth, currentY + 1);
        
      } else {
        // PDF de Venda
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Dados do Cliente', margin, currentY);
        currentY += 5;
        
        // Nome e Telefone
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Nome do Cliente', margin + 25, currentY);
        pdf.text('Telefone', margin + 80, currentY);
        
        currentY += 3;
        
        pdf.setDrawColor(209, 213, 219);
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, currentY, 50, dateBoxHeight, 'FD');
        pdf.rect(margin + 55, currentY, 40, dateBoxHeight, 'FD');
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const clienteNome = formData.cliente_nome.length > 20 ? formData.cliente_nome.substring(0, 20) + '...' : formData.cliente_nome;
        pdf.text(clienteNome, margin + 25, currentY + 5.5, { align: 'center' });
        pdf.text(formData.telefone_cliente || '', margin + 75, currentY + 5.5, { align: 'center' });
        
        currentY += 12;
        
        // CPF, Data Nascimento, Endereço
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CPF', margin + 15, currentY);
        pdf.text('Data Nascimento', margin + 50, currentY);
        pdf.text('Endereço', margin + 95, currentY);
        
        currentY += 3;
        
        pdf.setFillColor(255, 255, 255);
        pdf.rect(margin, currentY, 30, dateBoxHeight, 'FD');
        pdf.rect(margin + 35, currentY, 30, dateBoxHeight, 'FD');
        pdf.rect(margin + 70, currentY, 40, dateBoxHeight, 'FD');
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(formData.cpf || '', margin + 15, currentY + 5.5, { align: 'center' });
        pdf.text(formData.data_nascimento || '', margin + 50, currentY + 5.5, { align: 'center' });
        const endereco = formData.endereco && formData.endereco.length > 15 ? 
          formData.endereco.substring(0, 15) + '...' : formData.endereco || '';
        pdf.text(endereco, margin + 90, currentY + 5.5, { align: 'center' });
        
        currentY += 15;
        
        // Dados Financeiros
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Dados Financeiros', margin, currentY);
        currentY += 5;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Valor Total', margin + 20, currentY);
        pdf.text('Forma Pagamento', margin + 70, currentY);
        if (formData.forma_pagamento === 'credito') {
          pdf.text('Parcelas', margin + 115, currentY);
        }
        
        currentY += 3;
        
        pdf.setFillColor(255, 255, 255);
        pdf.rect(margin, currentY, 40, dateBoxHeight, 'FD');
        pdf.rect(margin + 45, currentY, 40, dateBoxHeight, 'FD');
        if (formData.forma_pagamento === 'credito') {
          pdf.rect(margin + 90, currentY, 20, dateBoxHeight, 'FD');
        }
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(formData.valor_total || '', margin + 20, currentY + 5.5, { align: 'center' });
        
        const formaPagamento = formData.forma_pagamento === 'dinheiro' ? 'Dinheiro' : 
          formData.forma_pagamento === 'debito' ? 'Débito' :
          formData.forma_pagamento === 'credito' ? 'Crédito' :
          formData.forma_pagamento === 'pix' ? 'PIX' : 'Outro';
        pdf.text(formaPagamento, margin + 65, currentY + 5.5, { align: 'center' });
        
        if (formData.forma_pagamento === 'credito') {
          pdf.text(formData.credito_parcelas || '', margin + 100, currentY + 5.5, { align: 'center' });
        }
        
        currentY += 15;
        
        // Descrição do Pedido e Observação do Cliente
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Descrição do Pedido', margin + 30, currentY);
        pdf.text('Observação do Cliente', margin + 95, currentY);
        
        currentY += 3;
        
        pdf.setFillColor(255, 255, 255);
        pdf.rect(margin, currentY, 60, 10, 'FD');
        pdf.rect(margin + 65, currentY, 60, 10, 'FD');
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        
        if (formData.descricao_pedido) {
          const descricaoLines = pdf.splitTextToSize(formData.descricao_pedido, 56);
          pdf.text(descricaoLines.slice(0, 2), margin + 2, currentY + 4);
        }
        
        if (formData.observacao_cliente) {
          const observacaoLines = pdf.splitTextToSize(formData.observacao_cliente, 56);
          pdf.text(observacaoLines.slice(0, 2), margin + 67, currentY + 4);
        }
      }

      // Salvar PDF
      const filename = type === 'laboratorio' 
        ? `OS-${nextNumOS}-Laboratorio.pdf`
        : `OS-${nextNumOS}-Venda.pdf`;
      
      pdf.save(filename);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF: ' + (error as Error).message);
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Nova Ordem de Serviço</h1>
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar OS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Informações da Ótica e N° OS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                {tenant.logo_url ? (
                  <img
                    src={tenant.logo_url}
                    alt={`Logo ${tenant.name}`}
                    className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {tenant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
                  <p className="text-gray-600">
                    {tenant.endereco ? 
                      `${tenant.endereco}${tenant.numero ? `, ${tenant.numero}` : ''}`
                      : 'Endereço não informado'
                    }
                  </p>
                  <p className="text-gray-600">Tel: (81) 98898-4547</p>
                </div>
              </div>
              
              <div className="text-right">
                <label className="block text-sm font-medium text-gray-700 mb-2">N° OS</label>
                <input
                  type="number"
                  value={nextNumOS}
                  onChange={(e) => handleNumOSChange(e.target.value)}
                  className="w-24 text-center text-2xl font-bold text-gray-900 bg-gray-100 border border-gray-300 rounded-lg px-4 py-2"
                  min="1"
                />
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Venda</label>
                <input
                  type="date"
                  value={formData.data_venda}
                  onChange={(e) => handleInputChange('data_venda', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Entrega</label>
                <input
                  type="date"
                  value={formData.data_entrega}
                  onChange={(e) => handleInputChange('data_entrega', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Dados do Cliente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Cliente *</label>
                <input
                  type="text"
                  value={formData.cliente_nome}
                  onChange={(e) => handleInputChange('cliente_nome', e.target.value)}
                  placeholder="Nome completo do cliente"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                <input
                  type="tel"
                  value={formData.telefone_cliente}
                  onChange={(e) => handleInputChange('telefone_cliente', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Graus */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Graus</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700 w-16"></th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-700">Esférico</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-700">Cilíndrico</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-700">Eixo</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-700">DNP</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-700">Altura</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700 bg-gray-50">OD</td>
                    <td className="border border-gray-300 p-0">
                      <input
                        type="text"
                        value={formData.esf_od}
                        onChange={(e) => handleInputChange('esf_od', e.target.value)}
                        placeholder="+2.50"
                        className="w-full px-4 py-3 text-center border-0 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-0">
                      <input
                        type="text"
                        value={formData.cil_od}
                        onChange={(e) => handleInputChange('cil_od', e.target.value)}
                        placeholder="-0.75"
                        className="w-full px-4 py-3 text-center border-0 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-0">
                      <input
                        type="text"
                        value={formData.eixo_od}
                        onChange={(e) => handleInputChange('eixo_od', e.target.value)}
                        placeholder="90"
                        className="w-full px-4 py-3 text-center border-0 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-0">
                      <input
                        type="text"
                        value={formData.dnp_od}
                        onChange={(e) => handleInputChange('dnp_od', e.target.value)}
                        placeholder="32"
                        className="w-full px-4 py-3 text-center border-0 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-0">
                      <input
                        type="text"
                        value={formData.altura_od}
                        onChange={(e) => handleInputChange('altura_od', e.target.value)}
                        placeholder="18"
                        className="w-full px-4 py-3 text-center border-0 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700 bg-gray-50">OE</td>
                    <td className="border border-gray-300 p-0">
                      <input
                        type="text"
                        value={formData.esf_oe}
                        onChange={(e) => handleInputChange('esf_oe', e.target.value)}
                        placeholder="+1.25"
                        className="w-full px-4 py-3 text-center border-0 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-0">
                      <input
                        type="text"
                        value={formData.cil_oe}
                        onChange={(e) => handleInputChange('cil_oe', e.target.value)}
                        placeholder="-1.00"
                        className="w-full px-4 py-3 text-center border-0 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-0">
                      <input
                        type="text"
                        value={formData.eixo_oe}
                        onChange={(e) => handleInputChange('eixo_oe', e.target.value)}
                        placeholder="5"
                        className="w-full px-4 py-3 text-center border-0 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-0">
                      <input
                        type="text"
                        value={formData.dnp_oe}
                        onChange={(e) => handleInputChange('dnp_oe', e.target.value)}
                        placeholder="31"
                        className="w-full px-4 py-3 text-center border-0 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-0">
                      <input
                        type="text"
                        value={formData.altura_oe}
                        onChange={(e) => handleInputChange('altura_oe', e.target.value)}
                        placeholder="17.5"
                        className="w-full px-4 py-3 text-center border-0 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Informações da Lente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Informações da Lente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Lente *</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipo_lente"
                      value="Visão Simples"
                      checked={formData.tipo_lente === 'Visão Simples'}
                      onChange={(e) => handleInputChange('tipo_lente', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">Visão Simples</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipo_lente"
                      value="Multifocal"
                      checked={formData.tipo_lente === 'Multifocal'}
                      onChange={(e) => handleInputChange('tipo_lente', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">Multifocal</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição da Lente</label>
                <input
                  type="text"
                  value={formData.descricao_lente}
                  onChange={(e) => handleInputChange('descricao_lente', e.target.value)}
                  placeholder="Ex: Lente antirreflexo, transitions, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {formData.tipo_lente === 'Multifocal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adição</label>
                  <input
                    type="text"
                    value={formData.adicao}
                    onChange={(e) => handleInputChange('adicao', e.target.value)}
                    placeholder="+2.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observação</label>
              <textarea
                value={formData.observacao}
                onChange={(e) => handleInputChange('observacao', e.target.value)}
                placeholder="Observações gerais sobre a OS"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
              />
            </div>
          </div>

          {/* Dados Financeiros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Dados Financeiros</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor_total}
                  onChange={(e) => handleInputChange('valor_total', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
                <select
                  value={formData.forma_pagamento}
                  onChange={(e) => handleInputChange('forma_pagamento', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                  <option value="pix">PIX</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              {formData.forma_pagamento === 'credito' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Parcelas</label>
                  <input
                    type="number"
                    value={formData.credito_parcelas}
                    onChange={(e) => handleInputChange('credito_parcelas', e.target.value)}
                    placeholder="1"
                    min="1"
                    max="12"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Observações Finais */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Observações Finais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição do Pedido</label>
                <textarea
                  value={formData.descricao_pedido}
                  onChange={(e) => handleInputChange('descricao_pedido', e.target.value)}
                  placeholder="Detalhes específicos do pedido"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observação do Cliente</label>
                <textarea
                  value={formData.observacao_cliente}
                  onChange={(e) => handleInputChange('observacao_cliente', e.target.value)}
                  placeholder="Comentários ou solicitações do cliente"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                />
              </div>
            </div>
          </div>

          {/* Botões de PDF */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => generatePDF('laboratorio')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              <FileText className="w-6 h-6" />
              <span>PDF Laboratório</span>
            </button>
            
            <button
              onClick={() => generatePDF('venda')}
              className="flex items-center space-x-2 bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors text-lg"
            >
              <Download className="w-6 h-6" />
              <span>PDF Venda</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}