/**
 * Utilitários para exportação de relatórios em diferentes formatos
 * com suporte a cache para melhorar a performance
 */

import { preloadImages } from './cacheUtils';

interface ExportOptions {
  /**
   * Dados a serem exportados
   */
  data: any[];
  
  /**
   * Filtros aplicados aos dados
   */
  filters: any;
  
  /**
   * Gráficos a serem incluídos (apenas para PDF)
   */
  charts?: React.ReactNode[];
  
  /**
   * Se deve incluir dados brutos
   */
  includeRawData?: boolean;
  
  /**
   * Nome do arquivo (opcional, será gerado automaticamente se não fornecido)
   */
  filename?: string;
}

/**
 * Exporta dados para PDF
 * @param options Opções de exportação
 * @returns Promise que resolve quando a exportação for concluída
 */
export async function exportToPDF(options: ExportOptions): Promise<void> {
  const { data, filters, charts = [], includeRawData = true, filename } = options;
  
  try {
    // Importar dinamicamente a biblioteca jsPDF para reduzir o tamanho do bundle inicial
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    // Criar novo documento PDF
    const doc = new jsPDF();
    
    // Adicionar título
    const title = 'Relatório Financeiro';
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Adicionar data e filtros
    doc.setFontSize(11);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 32);
    
    // Adicionar informações sobre os filtros
    let yPos = 38;
    if (filters) {
      doc.text('Filtros aplicados:', 14, yPos);
      yPos += 6;
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          const filterText = `${key}: ${value}`;
          doc.text(filterText, 14, yPos);
          yPos += 6;
        }
      });
    }
    
    // Adicionar gráficos se solicitado
    if (charts && charts.length > 0) {
      yPos += 10;
      doc.text('Gráficos:', 14, yPos);
      yPos += 10;
      
      // Pré-carregar imagens para melhorar a performance
      const chartImages: string[] = [];
      
      // Converter gráficos React em imagens base64
      for (let i = 0; i < charts.length; i++) {
        try {
          // Simular a conversão de gráficos em imagens
          // Em uma implementação real, isso seria feito com html2canvas ou similar
          const chartImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`;
          chartImages.push(chartImage);
        } catch (error) {
          console.error('Erro ao converter gráfico para imagem:', error);
        }
      }
      
      // Pré-carregar imagens para melhorar a performance
      await preloadImages(chartImages);
      
      // Adicionar imagens ao PDF
      for (let i = 0; i < chartImages.length; i++) {
        const chartImage = chartImages[i];
        
        // Adicionar imagem ao PDF
        doc.addImage(chartImage, 'PNG', 14, yPos, 180, 80);
        yPos += 90;
        
        // Verificar se precisa adicionar nova página
        if (yPos > 250 && i < chartImages.length - 1) {
          doc.addPage();
          yPos = 20;
        }
      }
    }
    
    // Adicionar dados brutos se solicitado
    if (includeRawData && data.length > 0) {
      // Adicionar nova página se necessário
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }
      
      doc.text('Dados detalhados:', 14, yPos);
      yPos += 10;
      
      // Extrair cabeçalhos da tabela
      const headers = Object.keys(data[0]);
      
      // Preparar dados para a tabela
      const tableData = data.map(item => Object.values(item));
      
      // Adicionar tabela
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: yPos,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      });
    }
    
    // Gerar nome do arquivo se não fornecido
    const outputFilename = filename || `relatorio_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Salvar o arquivo
    doc.save(outputFilename);
    
  } catch (error) {
    console.error('Erro ao exportar para PDF:', error);
    throw new Error('Não foi possível exportar para PDF. Tente novamente.');
  }
}

/**
 * Exporta dados para Excel
 * @param options Opções de exportação
 * @returns Promise que resolve quando a exportação for concluída
 */
export async function exportToExcel(options: ExportOptions): Promise<void> {
  const { data, filters, includeRawData = true, filename } = options;
  
  try {
    // Importar dinamicamente a biblioteca xlsx para reduzir o tamanho do bundle inicial
    const XLSX = await import('xlsx');
    
    // Preparar dados para o Excel
    const workbookData: any[] = [];
    
    // Adicionar informações sobre os filtros
    workbookData.push(['Relatório Financeiro']);
    workbookData.push(['Data:', new Date().toLocaleDateString('pt-BR')]);
    workbookData.push([]);
    
    if (filters) {
      workbookData.push(['Filtros aplicados:']);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          workbookData.push([key, value]);
        }
      });
      
      workbookData.push([]);
    }
    
    // Adicionar dados brutos se solicitado
    if (includeRawData && data.length > 0) {
      workbookData.push(['Dados detalhados:']);
      workbookData.push([]);
      
      // Extrair cabeçalhos da tabela
      const headers = Object.keys(data[0]);
      workbookData.push(headers);
      
      // Adicionar dados
      data.forEach(item => {
        workbookData.push(Object.values(item));
      });
    }
    
    // Criar planilha
    const worksheet = XLSX.utils.aoa_to_sheet(workbookData);
    
    // Criar workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
    
    // Gerar nome do arquivo se não fornecido
    const outputFilename = filename || `relatorio_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Salvar o arquivo
    XLSX.writeFile(workbook, outputFilename);
    
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw new Error('Não foi possível exportar para Excel. Tente novamente.');
  }
}

/**
 * Exporta dados para CSV
 * @param options Opções de exportação
 * @returns Promise que resolve quando a exportação for concluída
 */
export async function exportToCSV(options: ExportOptions): Promise<void> {
  const { data, filename } = options;
  
  try {
    // Verificar se há dados para exportar
    if (!data || data.length === 0) {
      throw new Error('Não há dados para exportar.');
    }
    
    // Extrair cabeçalhos da tabela
    const headers = Object.keys(data[0]);
    
    // Converter dados para CSV
    const csvContent = [
      headers.join(','),
      ...data.map(item => Object.values(item).join(','))
    ].join('\n');
    
    // Criar blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Criar URL para download
    const url = URL.createObjectURL(blob);
    
    // Criar link para download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    // Adicionar link ao DOM
    document.body.appendChild(link);
    
    // Clicar no link para iniciar o download
    link.click();
    
    // Remover link do DOM
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('Erro ao exportar para CSV:', error);
    throw new Error('Não foi possível exportar para CSV. Tente novamente.');
  }
}