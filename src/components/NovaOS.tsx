import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, Download, Plus, Minus } from 'lucide-react';
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
  status_pagamento: string;
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
    status_pagamento: 'Pago',
    esf_od: '',
    cil_od: '',
    eixo_od: '',
    esf_oe: '',
    cil_oe: '',
    eixo_oe: '',
    adicao: '1.00',
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
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [dateError, setDateError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Função para formatar valores com sinal + para positivos
  const formatWithPlusSign = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '';
    if (numValue > 0) {
      return `+${numValue.toFixed(2)}`;
    }
    return numValue.toFixed(2);
  };

  // Função para remover formatação e obter valor numérico
  const parseNumericValue = (value: string): number => {
    const cleanValue = value.replace(/^\+/, '');
    return parseFloat(cleanValue) || 0;
  };

  // Funções para validação e ajuste de valores
  const roundToMultiple = (value: number, multiple: number): number => {
    return Math.round(value / multiple) * multiple;
  };

  const formatValue = (value: number, decimals: number = 2): string => {
    return value.toFixed(decimals).replace(/\.?0+$/, '');
  };

  const adjustValue = (field: keyof typeof formData, increment: number, type: string) => {
    const currentValue = parseFloat(formData[field] as string) || 0;
    let newValue = currentValue + increment;

    // Aplicar regras específicas por tipo
    switch (type) {
      case 'esferico':
        // Esférico: múltiplos de 0.25, pode ser positivo ou negativo
        newValue = roundToMultiple(newValue, 0.25);
        break;
      
      case 'cilindrico':
        // Cilíndrico: múltiplos de 0.25, apenas negativo ou zero
        newValue = roundToMultiple(newValue, 0.25);
        if (newValue > 0) newValue = 0;
        break;
      
      case 'eixo':
        // Eixo: múltiplos de 5, entre 0 e 180
        newValue = roundToMultiple(newValue, 5);
        if (newValue < 0) newValue = 0;
        if (newValue > 180) newValue = 180;
        break;
      
      case 'dnp':
      case 'altura':
        // DNP e Altura: números inteiros, máximo 100
        newValue = Math.round(newValue);
        if (newValue < 0) newValue = 0;
        if (newValue > 100) newValue = 100;
        break;
    }

    // Formatar o valor
    const formattedValue = type === 'eixo' || type === 'dnp' || type === 'altura' 
      ? newValue.toString() 
      : formatValue(newValue);

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData, type: string) => {
    const value = e.target.value;
    
    // Permitir entrada temporária para digitação
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateAndCorrect = (e: React.FocusEvent<HTMLInputElement>, field: keyof typeof formData, type: string) => {
    const value = parseFloat(e.target.value) || 0;
    let correctedValue = value;

    // Aplicar correções específicas por tipo
    switch (type) {
      case 'esferico':
        correctedValue = roundToMultiple(value, 0.25);
        break;
      
      case 'cilindrico':
        correctedValue = roundToMultiple(value, 0.25);
        if (correctedValue > 0) correctedValue = 0;
        break;
      
      case 'eixo':
        correctedValue = roundToMultiple(value, 5);
        if (correctedValue < 0) correctedValue = 0;
        if (correctedValue > 180) correctedValue = 180;
        break;
      
      case 'dnp':
      case 'altura':
        correctedValue = Math.round(value);
        if (correctedValue < 0) correctedValue = 0;
        if (correctedValue > 100) correctedValue = 100;
        break;
    }

    // Formatar o valor corrigido
    const formattedValue = type === 'eixo' || type === 'dnp' || type === 'altura' 
      ? correctedValue.toString() 
      : formatValue(correctedValue);

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

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
    if (field === 'telefone_cliente') {
      // Formatação automática do telefone
      const formatted = formatPhoneInput(value);
      setFormData(prev => ({
        ...prev,
        [field]: formatted
      }));

      // Validação do telefone
      validatePhone(formatted);
    } else if (field === 'valor_total') {
      // Formatação automática de moeda
      const formatted = formatCurrencyInput(value);
      setFormData(prev => ({
        ...prev,
        [field]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Extrair números do telefone para validação
    const phoneNumbers = field === 'telefone_cliente' ? extractPhoneNumbers(value) : extractPhoneNumbers(formData.telefone_cliente);

    // Validar datas quando uma delas for alterada
    if (field === 'data_venda' || field === 'data_entrega') {
      validateDates(field === 'data_venda' ? value : formData.data_venda, 
                   field === 'data_entrega' ? value : formData.data_entrega);
    }
    
    // Atualizar lista de erros
    updateValidationErrors();
  };

  const handleAdicaoChange = (increment: boolean) => {
    const currentValue = parseFloat(formData.adicao) || 1.00;
    let newValue;
    
    if (increment) {
      newValue = Math.min(currentValue + 0.25, 4.00);
    } else {
      newValue = Math.max(currentValue - 0.25, 1.00);
    }
    
    setFormData(prev => ({ ...prev, adicao: newValue.toFixed(2) }));
  };

  // Função para formatar telefone durante a digitação
  const formatPhoneInput = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica formatação baseada no número de dígitos
    if (limitedNumbers.length <= 2) {
      return `(${limitedNumbers}`;
    } else if (limitedNumbers.length <= 3) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    } else if (limitedNumbers.length <= 7) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 3)} ${limitedNumbers.slice(3)}`;
    } else {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 3)} ${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  // Função para extrair apenas os números do telefone
  const extractPhoneNumbers = (formattedPhone: string): string => {
    return formattedPhone.replace(/\D/g, '');
  };

  // Função para extrair apenas os números (alias para compatibilidade)
  const extractNumbers = (formattedPhone: string): string => {
    return formattedPhone.replace(/\D/g, '');
  };

  // Funções de formatação de moeda
  const formatCurrencyInput = (value: string): string => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');

    if (!numbers) return '';

    // Converte para número e divide por 100 para ter os centavos
    const amount = parseInt(numbers) / 100;

    // Formata como moeda brasileira
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const extractCurrencyValue = (formattedValue: string): string => {
    // Remove formatação e retorna apenas números com ponto decimal
    const numbers = formattedValue.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers) / 100;
    return amount.toString();
  };

  // Validação do telefone
  const validatePhone = (phone: string) => {
    const numbers = extractPhoneNumbers(phone);
    
    if (numbers.length > 0 && numbers.length !== 11) {
      setPhoneError('O telefone deve ter exatamente 11 dígitos');
    } else {
      setPhoneError('');
    }
  };

  const validateDates = (dataVenda: string, dataEntrega: string) => {
    if (dataVenda && dataEntrega) {
      const venda = new Date(dataVenda);
      const entrega = new Date(dataEntrega);
      
      if (entrega < venda) {
        setDateError('A data de entrega não pode ser anterior à data de venda');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  };

  // Função para atualizar lista de erros de validação
  const updateValidationErrors = () => {
    const errors: string[] = [];
    
    if (dateError) {
      errors.push(dateError);
    }
    
    if (phoneError) {
      errors.push(phoneError);
    }
    
    setValidationErrors(errors);
  };

  // Atualizar erros quando dateError ou phoneError mudarem
  React.useEffect(() => {
    updateValidationErrors();
  }, [dateError, phoneError]);

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

  // Função para validação completa (incluindo campos não tocados)
  const getCompleteValidationErrors = () => {
    const errors: string[] = [];
    
    if (!formData.cliente_nome.trim()) {
      errors.push('Nome do cliente é obrigatório');
    }
    
    const phoneNumbers = extractNumbers(formData.telefone_cliente);
    if (!formData.telefone_cliente.trim()) {
      errors.push('Telefone é obrigatório');
    } else if (phoneNumbers.length !== 11) {
      errors.push('O telefone deve ter exatamente 11 dígitos');
    }
    
    if (!formData.tipo_lente.trim()) {
      errors.push('Tipo de lente é obrigatório');
    }
    
    // Validação de data
    if (formData.data_entrega && formData.data_venda) {
      const dataVenda = new Date(formData.data_venda);
      const dataEntrega = new Date(formData.data_entrega);
      if (dataEntrega < dataVenda) {
        errors.push('A data de entrega não pode ser anterior à data de venda');
      }
    }
    
    return errors;
  };

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a formatação progressiva
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  };

  // Função para lidar com mudanças no CPF
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  // Função para marcar campo como "tocado"
  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
  };

  const handleSave = async () => {
    // Usar validação completa na hora de salvar
    const completeErrors = getCompleteValidationErrors();
    
    if (completeErrors.length > 0) {
      alert(`Por favor, corrija os seguintes erros antes de salvar:\n\n${completeErrors.join('\n')}`);
      // Marcar todos os campos como tocados para mostrar os erros
      setTouchedFields(new Set(['cliente_nome', 'telefone_cliente', 'tipo_lente', 'data_entrega']));
      return;
    }
    
    setIsSaving(true);

    try {
      // Extrair apenas os números do telefone para salvar no banco
      const phoneNumbers = extractPhoneNumbers(formData.telefone_cliente);
      
      const orderData = {
        tenant_id: tenant.id,
        num_os: nextNumOS,
        cliente_nome: formData.cliente_nome,
        telefone_cliente: phoneNumbers, // Salvar apenas os números
        cpf: formData.cpf || null,
        endereco: formData.endereco || null,
        data_nascimento: formData.data_nascimento || null,
        data_venda: formData.data_venda || null,
        data_entrega: formData.data_entrega || null,
        valor_total: formData.valor_total ? parseFloat(extractCurrencyValue(formData.valor_total)) : null,
        forma_pagamento: formData.forma_pagamento || null,
        credito_parcelas: formData.credito_parcelas ? parseInt(formData.credito_parcelas) : null,
        status_pagamento: formData.status_pagamento || null,
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

  // Função para formatar valores com sinal de +
  const formatValueWithSign = (value: string | null) => {
    if (!value || value === '' || value === '0' || value === '0.00') return '';
    
    // Remove qualquer sinal existente para processar corretamente
    const cleanValue = value.replace(/^[+-]/, '');
    const numValue = parseFloat(cleanValue);
    
    if (isNaN(numValue)) return value;
    
    // Se o valor original tinha sinal negativo, manter negativo
    if (value.startsWith('-')) {
      return numValue.toFixed(2);
    }
    // Se positivo, adicionar sinal de +
    else if (numValue > 0) {
      return `+${numValue.toFixed(2)}`;
    }
    
    return numValue.toFixed(2);
  };

  const generatePDF = async (type: 'laboratorio' | 'venda') => {
    try {
      const doc = new jsPDF();
      
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
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pageWidth / 2, currentY + 2, { align: 'center' });
      currentY += 6;
      
      // Cabeçalho com logo e informações da ótica
      const logoSize = 14;
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
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      const tenantName = tenant.name.length > 25 ? tenant.name.substring(0, 25) + '...' : tenant.name;
      pdf.text(tenantName, infoX, currentY + 4);

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const endereco = tenant.endereco ? tenant.endereco : 'Endereço não informado';
      const enderecoTruncated = endereco.length > 40 ? endereco.substring(0, 40) + '...' : endereco;
      pdf.text(enderecoTruncated, infoX, currentY + 8);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Tel: ${tenant.telefone || '(81) 98898-4547'}`, infoX, currentY + 11);
      
      // N° OS com título alinhado com o nome da ótica
      const osBoxWidth = 22;
      const osBoxHeight = 11;
      const osBoxX = pageWidth - margin - osBoxWidth;
      const osBoxY = currentY + 1;

      // Caixa do número da OS
      pdf.setDrawColor(209, 213, 219);
      pdf.setFillColor(249, 250, 251);
      pdf.rect(osBoxX, osBoxY, osBoxWidth, osBoxHeight, 'FD');

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text(nextNumOS.toString(), osBoxX + osBoxWidth/2, osBoxY + 7.5, { align: 'center' });
      pdf.setTextColor(0, 0, 0);

      currentY += 20;
      
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

      // Datas na mesma linha
      currentY += 3;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      // Data de Venda
      const dataVendaLabel = 'Data de Venda: ';
      const dataVendaValue = formatDate(formData.data_venda) || '';
      pdf.text(dataVendaLabel, margin, currentY);
      const labelWidth = pdf.getTextWidth(dataVendaLabel);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(dataVendaValue, margin + labelWidth + 2, currentY);
      const valueWidth = pdf.getTextWidth(dataVendaValue);
      const dataVendaLineWidth = dataVendaValue ? valueWidth : 28;
      pdf.setDrawColor(156, 163, 175);
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
      const dataEntregaLineWidth = dataEntregaValue ? dataEntregaValueWidth : 28;
      const totalEntregaWidth = dataEntregaLabelWidth + 2 + dataEntregaLineWidth;
      const dataEntregaX = pageWidth - margin - totalEntregaWidth;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(dataEntregaLabel, dataEntregaX, currentY);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(dataEntregaValue, dataEntregaX + dataEntregaLabelWidth + 2, currentY);
      pdf.line(dataEntregaX + dataEntregaLabelWidth + 2, currentY + 1, dataEntregaX + dataEntregaLabelWidth + 2 + dataEntregaLineWidth, currentY + 1);

      currentY += 12;
      
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
        pdf.text(clienteNome, margin + nomeLabelWidth + 6, currentY); // Espaço ajustado
        const nomeValueWidth = pdf.getTextWidth(clienteNome);
        const nomeAreaWidth = (pageWidth - 2 * margin) * 0.60;
        // Linha apenas no valor
        pdf.line(margin + nomeLabelWidth + 6, currentY + 1, margin + nomeLabelWidth + 6 + Math.max(nomeValueWidth, nomeAreaWidth - nomeLabelWidth - 6), currentY + 1);
        
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
        pdf.text(telefoneValue, telefoneX + telefoneLabelWidth, currentY); // Sem espaço extra
        // Linha apenas no valor
        pdf.line(telefoneX + telefoneLabelWidth, currentY + 1, telefoneX + telefoneLabelWidth + telefoneLineWidth, currentY + 1);
        
        currentY += 8;
        
        // Determinar valor da adição baseado no tipo de lente
        const adicaoValue = formData.tipo_lente === 'Multifocal'
          ? formatValueWithSign(formData.adicao)
          : '---';

        // Tabela de graus usando autoTable com coluna Adição
        const grausData = [
          ['OD', formatValueWithSign(formData.esf_od), formData.cil_od || '', formData.eixo_od || '', formData.dnp_od || '', formData.altura_od || '', adicaoValue],
          ['OE', formatValueWithSign(formData.esf_oe), formData.cil_oe || '', formData.eixo_oe || '', formData.dnp_oe || '', formData.altura_oe || '', '']
        ];

        const tableStartY = currentY;

        autoTable(pdf, {
          startY: currentY,
          head: [['', 'Esférico', 'Cilíndrico', 'Eixo', 'DNP', 'Altura', 'Adição']],
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
            1: { cellWidth: 21 },
            2: { cellWidth: 21 },
            3: { cellWidth: 19 },
            4: { cellWidth: 19 },
            5: { cellWidth: 19 },
            6: { cellWidth: 22, fontSize: 11, fontStyle: 'bold' }
          },
          tableWidth: pageWidth - 2 * margin,
          margin: { left: margin, right: margin },
          didDrawCell: (data) => {
            // Mesclar a célula de Adição nas duas linhas (OD e OE)
            if (data.column.index === 6) {
              const cellY = data.cell.y;
              const cellX = data.cell.x;
              const cellWidth = data.cell.width;
              const cellHeight = data.cell.height;

              if (data.row.index === 0) {
                // Linha OD - remover linha inferior da célula de adição completamente
                pdf.setFillColor(255, 255, 255);
                pdf.rect(cellX + 0.25, cellY + cellHeight - 0.5, cellWidth - 0.5, 1, 'F');
              } else if (data.row.index === 1) {
                // Linha OE - limpar o conteúdo e remover linha superior completamente
                pdf.setFillColor(255, 255, 255);
                pdf.rect(cellX + 0.25, cellY - 0.5, cellWidth - 0.5, 1, 'F');
              }
            }
          },
          didDrawPage: (data) => {
            // Após desenhar a tabela, adicionar o valor da adição centralizado verticalmente
            if (adicaoValue) {
              const headHeight = data.table.head[0].height;
              const bodyHeight = data.table.body[0].height + data.table.body[1].height;

              // Posição da coluna de adição (última coluna)
              const adicaoColumnX = pageWidth - margin - 22;
              const adicaoColumnWidth = 22;
              const adicaoCenterX = adicaoColumnX + adicaoColumnWidth / 2;

              // Posição Y centralizada entre OD e OE
              const bodyCenterY = tableStartY + headHeight + bodyHeight / 2;

              // Limpar o texto anterior da primeira linha
              pdf.setFillColor(255, 255, 255);
              pdf.rect(adicaoColumnX + 0.5, tableStartY + headHeight + 0.5, adicaoColumnWidth - 1, bodyHeight - 1, 'F');

              // Desenhar o valor centralizado
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(0, 0, 0);
              pdf.text(adicaoValue, adicaoCenterX, bodyCenterY + 1, { align: 'center' });
            }
          }
        });

        currentY = pdf.lastAutoTable.finalY + 6;

        // Tipo de lente e descrição da lente na mesma linha
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tipo de Lente', margin, currentY);

        currentY += 4;

        // Radio buttons para tipo de lente
        const radioSize = 3;
        pdf.setDrawColor(75, 85, 99);
        pdf.setFillColor(formData.tipo_lente === 'Visão Simples' ? 75 : 255, formData.tipo_lente === 'Visão Simples' ? 85 : 255, formData.tipo_lente === 'Visão Simples' ? 99 : 255);
        pdf.circle(margin + 2, currentY + 1, radioSize/2, 'FD');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Visão Simples', margin + 6, currentY + 2);

        pdf.setFillColor(formData.tipo_lente === 'Multifocal' ? 75 : 255, formData.tipo_lente === 'Multifocal' ? 85 : 255, formData.tipo_lente === 'Multifocal' ? 99 : 255);
        pdf.circle(margin + 2, currentY + 5, radioSize/2, 'FD');
        pdf.text('Multifocal', margin + 6, currentY + 6);

        // Descrição da lente ao lado do tipo de lente - centralizada verticalmente
        const descricaoLente = formData.descricao_lente || '';
        const descricaoStartX = margin + 42;
        const descricaoEndX = pageWidth - margin;
        const descricaoLineLength = descricaoEndX - descricaoStartX;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        // Calcular a posição Y centralizada (meio da área dos radio buttons)
        const descricaoY = currentY + 3.5;

        // Desenhar a linha para descrição
        pdf.setDrawColor(156, 163, 175);
        pdf.line(descricaoStartX, descricaoY + 1, descricaoEndX, descricaoY + 1);

        // Centralizar o texto na linha
        if (descricaoLente) {
          const textWidth = pdf.getTextWidth(descricaoLente);
          const textX = descricaoStartX + (descricaoLineLength - textWidth) / 2;
          pdf.text(descricaoLente, textX, descricaoY);
        }

        currentY += 14; // Espaço antes da observação (aumentado)
        
        // Observação com underline
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const obsLabel = 'Obs.: ';
        const obsLabelWidth = pdf.getTextWidth(obsLabel);
        pdf.text(obsLabel, margin, currentY);
        
        // Linha apenas após o label
        const obsLineWidth = pageWidth - 2 * margin - obsLabelWidth;
        pdf.setDrawColor(156, 163, 175); // Cor cinza
        pdf.line(margin + obsLabelWidth, currentY + 1, margin + obsLabelWidth + obsLineWidth, currentY + 1);
        
        // Texto da observação (se houver)
        if (formData.observacao) {
          pdf.text(formData.observacao, margin + obsLabelWidth + 2, currentY);
        }
        
} else {
        // PDF de Venda - layout clean e profissional

        // Nome - linha começando mais à direita ainda
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Nome:', margin, currentY);

        currentY += 4;

        const clienteNome = formData.cliente_nome || '';
        const nomeStartX = margin + 12; // CORRIGIDO: começar à direita
        const nomeValueWidth = pdf.getTextWidth(clienteNome);
        const nomeLineWidth = Math.max(nomeValueWidth + 2, pageWidth - 2 * margin - 12);
        pdf.setDrawColor(156, 163, 175);
        pdf.line(nomeStartX, currentY, nomeStartX + nomeLineWidth, currentY);

        if (clienteNome) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(clienteNome, nomeStartX, currentY - 1);
        }

        currentY += 6;

        // Valor Total e Forma de Pagamento na mesma linha
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        const valorLabel = 'Valor Total: ';
        const valorValue = formData.valor_total ? `R$ ${formData.valor_total}` : 'R$ 0,00';
        const valorLabelWidth = pdf.getTextWidth(valorLabel);

        pdf.text(valorLabel, margin, currentY);

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(valorValue, margin + valorLabelWidth + 1, currentY);
        const valorValueWidth = pdf.getTextWidth(valorValue);
        const valorLineWidth = valorValueWidth + 2;
        pdf.setDrawColor(156, 163, 175);
        pdf.line(margin + valorLabelWidth + 1, currentY + 1, margin + valorLabelWidth + 1 + valorLineWidth, currentY + 1);

        // Forma de Pagamento (lado direito) - mais à esquerda para caber textos longos
        const rightColumnX = pageWidth / 2 - 4; // Mais à esquerda
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const formaPagLabel = 'Forma de Pagamento: ';
        const formaPagamento = formData.forma_pagamento === 'dinheiro' ? 'Dinheiro' :
          formData.forma_pagamento === 'debito' ? 'Débito' :
          formData.forma_pagamento === 'credito' ? 'Crédito' :
          formData.forma_pagamento === 'pix' ? 'PIX' : 'Outro';
        const formaPagLabelWidth = pdf.getTextWidth(formaPagLabel);

        pdf.text(formaPagLabel, rightColumnX, currentY);

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(formaPagamento, rightColumnX + formaPagLabelWidth + 1, currentY);
        const formaPagValueWidth = pdf.getTextWidth(formaPagamento);
        const formaPagLineWidth = formaPagValueWidth + 2;
        pdf.setDrawColor(156, 163, 175);
        pdf.line(rightColumnX + formaPagLabelWidth + 1, currentY + 1, rightColumnX + formaPagLabelWidth + 1 + formaPagLineWidth, currentY + 1);

        currentY += 6;

        // Parcelas e Status do Pagamento na mesma linha
        const parcelasLabel = 'Parcelas: ';
        let parcelasValue = '---';

        if (formData.forma_pagamento === 'credito' && formData.credito_parcelas) {
          parcelasValue = formData.credito_parcelas;
        }

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const parcelasLabelWidth = pdf.getTextWidth(parcelasLabel);

        pdf.text(parcelasLabel, margin, currentY);

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(parcelasValue, margin + parcelasLabelWidth + 1, currentY);
        const parcelasValueWidth = pdf.getTextWidth(parcelasValue);
        const parcelasLineWidth = parcelasValueWidth + 2;
        pdf.setDrawColor(156, 163, 175);
        pdf.line(margin + parcelasLabelWidth + 1, currentY + 1, margin + parcelasLabelWidth + 1 + parcelasLineWidth, currentY + 1);

        // Status do Pagamento - alinhado com Forma de Pagamento
        const statusPagLabel = 'Status do Pagamento: ';
        const statusPagValue = formData.status_pagamento || 'Pago';

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const statusPagLabelWidth = pdf.getTextWidth(statusPagLabel);
        pdf.text(statusPagLabel, rightColumnX, currentY);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(statusPagValue, rightColumnX + statusPagLabelWidth + 1, currentY);
        const statusPagValueWidth = pdf.getTextWidth(statusPagValue);
        const statusPagLineWidth = statusPagValueWidth + 2;
        pdf.setDrawColor(156, 163, 175);
        pdf.line(rightColumnX + statusPagLabelWidth + 1, currentY + 1, rightColumnX + statusPagLabelWidth + 1 + statusPagLineWidth, currentY + 1);

        currentY += 6; // CORRIGIDO: subir os campos

        // Descrição do Pedido - SUBINDO a posição
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Descrição do Pedido:', margin, currentY);

        currentY += 3;

        // Caixa para descrição
        const boxHeight = 11;
        const boxWidth = pageWidth - 2 * margin;
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, currentY, boxWidth, boxHeight, 'FD');

        if (formData.descricao_pedido) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const descLines = pdf.splitTextToSize(formData.descricao_pedido, boxWidth - 4);
          pdf.text(descLines.slice(0, 2), margin + 2, currentY + 4.5);
        }

        currentY += boxHeight + 2; // CORRIGIDO: subir os campos

        // Observações - SUBINDO a posição
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Observações:', margin, currentY);

        currentY += 3;

        // Caixa para observações
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, currentY, boxWidth, boxHeight, 'FD');

        if (formData.observacao_cliente) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const obsLines = pdf.splitTextToSize(formData.observacao_cliente, boxWidth - 4);
          pdf.text(obsLines.slice(0, 2), margin + 2, currentY + 4.5);
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
                    {tenant.endereco || 'Endereço não informado'}
                  </p>
                  <p className="text-gray-600">Tel: {tenant.telefone || '(81) 98898-4547'}</p>
                </div>
              </div>
              
              <div className="text-right">
                <label htmlFor="num_os" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  N° OS
                </label>
                <input
                  type="number"
                  value={nextNumOS}
                  onChange={(e) => handleNumOSChange(e.target.value)}
                  className="w-32 text-center text-2xl font-bold text-gray-900 bg-gray-100 border border-gray-300 rounded-lg px-4 py-2"
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                    dateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Entrega</label>
                <input
                  type="date"
                  value={formData.data_entrega}
                  onChange={(e) => handleInputChange('data_entrega', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                    dateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>
            
            {/* Alerta de erro de data */}
            {dateError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-red-700 font-medium">
                  {dateError}
                </div>
              </div>
            )}
            
            {/* Alerta geral de erros de validação */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
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
                  onBlur={() => handleFieldBlur('telefone_cliente')}
                  placeholder="(11) 9 9999-9999"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                    phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={handleCPFChange}
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
            
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse print:text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700 w-16"></th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-700 print:px-1">Esférico</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-700 print:px-1">Cilíndrico</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-700 print:px-1">Eixo</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-700 print:px-1">DNP</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-700 print:px-1">Altura</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-2 font-medium text-gray-700 bg-gray-50 print:px-1">OD</td>
                    <td className="border border-gray-300 px-1 py-2 print:px-0.5">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => adjustValue('esf_od', -0.25, 'esferico')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={formData.esf_od && parseFloat(formData.esf_od) > 0 ? `+${formData.esf_od}` : formData.esf_od}
                          onChange={(e) => handleManualInput(e, 'esf_od', 'esferico')}
                          onBlur={(e) => validateAndCorrect(e, 'esf_od', 'esferico')}
                          className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent print:border-none print:w-full"
                          placeholder="0.00"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue('esf_od', 0.25, 'esferico')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-1 py-2 print:px-0.5">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => adjustValue('cil_od', -0.25, 'cilindrico')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={formData.cil_od}
                          onChange={(e) => handleManualInput(e, 'cil_od', 'cilindrico')}
                          onBlur={(e) => validateAndCorrect(e, 'cil_od', 'cilindrico')}
                          className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent print:border-none print:w-full"
                          placeholder="0.00"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue('cil_od', 0.25, 'cilindrico')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-1 py-2 print:px-0.5">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => adjustValue('eixo_od', -5, 'eixo')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={formData.eixo_od}
                          onChange={(e) => handleManualInput(e, 'eixo_od', 'eixo')}
                          onBlur={(e) => validateAndCorrect(e, 'eixo_od', 'eixo')}
                          className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent print:border-none print:w-full"
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue('eixo_od', 5, 'eixo')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-1 py-2 print:px-0.5">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => adjustValue('dnp_od', -1, 'dnp')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={formData.dnp_od}
                          onChange={(e) => handleManualInput(e, 'dnp_od', 'dnp')}
                          onBlur={(e) => validateAndCorrect(e, 'dnp_od', 'dnp')}
                          className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent print:border-none print:w-full"
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue('dnp_od', 1, 'dnp')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-1 py-2 print:px-0.5">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => adjustValue('altura_od', -1, 'altura')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={formData.altura_od}
                          onChange={(e) => handleManualInput(e, 'altura_od', 'altura')}
                          onBlur={(e) => validateAndCorrect(e, 'altura_od', 'altura')}
                          className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent print:border-none print:w-full"
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue('altura_od', 1, 'altura')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-2 font-medium text-gray-700 bg-gray-50 print:px-1">OE</td>
                    <td className="border border-gray-300 px-1 py-2 print:px-0.5">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => adjustValue('esf_oe', -0.25, 'esferico')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={formData.esf_oe && parseFloat(formData.esf_oe) > 0 ? `+${formData.esf_oe}` : formData.esf_oe}
                          onChange={(e) => handleManualInput(e, 'esf_oe', 'esferico')}
                          onBlur={(e) => validateAndCorrect(e, 'esf_oe', 'esferico')}
                          className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent print:border-none print:w-full"
                          placeholder="0.00"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue('esf_oe', 0.25, 'esferico')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-1 py-2 print:px-0.5">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => adjustValue('cil_oe', -0.25, 'cilindrico')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={formData.cil_oe}
                          onChange={(e) => handleManualInput(e, 'cil_oe', 'cilindrico')}
                          onBlur={(e) => validateAndCorrect(e, 'cil_oe', 'cilindrico')}
                          className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent print:border-none print:w-full"
                          placeholder="0.00"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue('cil_oe', 0.25, 'cilindrico')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-1 py-2 print:px-0.5">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => adjustValue('eixo_oe', -5, 'eixo')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={formData.eixo_oe}
                          onChange={(e) => handleManualInput(e, 'eixo_oe', 'eixo')}
                          onBlur={(e) => validateAndCorrect(e, 'eixo_oe', 'eixo')}
                          className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent print:border-none print:w-full"
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue('eixo_oe', 5, 'eixo')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-1 py-2 print:px-0.5">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => adjustValue('dnp_oe', -1, 'dnp')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={formData.dnp_oe}
                          onChange={(e) => handleManualInput(e, 'dnp_oe', 'dnp')}
                          onBlur={(e) => validateAndCorrect(e, 'dnp_oe', 'dnp')}
                          className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent print:border-none print:w-full"
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue('dnp_oe', 1, 'dnp')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-1 py-2 print:px-0.5">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => adjustValue('altura_oe', -1, 'altura')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={formData.altura_oe}
                          onChange={(e) => handleManualInput(e, 'altura_oe', 'altura')}
                          onBlur={(e) => validateAndCorrect(e, 'altura_oe', 'altura')}
                          className="w-16 px-1 py-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent print:border-none print:w-full"
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue('altura_oe', 1, 'altura')}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold flex items-center justify-center print:hidden"
                        >
                          +
                        </button>
                      </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adição
                  </label>
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => handleAdicaoChange(false)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={`+${formData.adicao}`}
                      readOnly
                      className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                      placeholder="+1.00"
                    />
                    <button 
                      type="button"
                      onClick={() => handleAdicaoChange(true)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
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
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={formData.valor_total}
                    onChange={(e) => handleInputChange('valor_total', e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parcelas</label>
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

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status do Pagamento</label>
              <select
                value={formData.status_pagamento}
                onChange={(e) => handleInputChange('status_pagamento', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Pago">Pago</option>
                <option value="A pagar na entrega">A pagar na entrega</option>
                <option value="outro">Outro</option>
              </select>
              {formData.status_pagamento === 'outro' && (
                <input
                  type="text"
                  value={formData.status_pagamento === 'outro' ? '' : formData.status_pagamento}
                  onChange={(e) => handleInputChange('status_pagamento', e.target.value)}
                  placeholder="Digite o status do pagamento"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                />
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
                  placeholder="Observações sobre a venda"
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