import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartDescription, ChartDataTable } from '@/components/accessibility/ChartDescription';
import { testAccessibility } from '../utils/accessibility-utils';

describe('ChartDescription Accessibility', () => {
  it('should have no accessibility violations', async () => {
    await testAccessibility(
      <ChartDescription 
        id="chart-desc-1"
        title="Despesas Mensais"
        description="Gráfico de barras mostrando despesas mensais ao longo do ano"
        data="Janeiro: R$ 1000, Fevereiro: R$ 1200, Março: R$ 900"
      />
    );
  });

  it('should render with correct attributes for screen readers', () => {
    render(
      <ChartDescription 
        id="chart-desc-1"
        title="Despesas Mensais"
        description="Gráfico de barras mostrando despesas mensais ao longo do ano"
        data="Janeiro: R$ 1000, Fevereiro: R$ 1200, Março: R$ 900"
      />
    );
    
    const container = screen.getByText('Despesas Mensais').closest('div');
    expect(container).toHaveAttribute('id', 'chart-desc-1');
    expect(container).toHaveClass('sr-only');
    expect(container).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render title and description', () => {
    render(
      <ChartDescription 
        id="chart-desc-1"
        title="Despesas Mensais"
        description="Gráfico de barras mostrando despesas mensais ao longo do ano"
      />
    );
    
    expect(screen.getByText('Despesas Mensais')).toBeInTheDocument();
    expect(screen.getByText('Gráfico de barras mostrando despesas mensais ao longo do ano')).toBeInTheDocument();
  });

  it('should render data section when data is provided', () => {
    render(
      <ChartDescription 
        id="chart-desc-1"
        title="Despesas Mensais"
        description="Gráfico de barras mostrando despesas mensais ao longo do ano"
        data="Janeiro: R$ 1000, Fevereiro: R$ 1200, Março: R$ 900"
      />
    );
    
    expect(screen.getByText('Dados do gráfico:')).toBeInTheDocument();
    expect(screen.getByText('Janeiro: R$ 1000, Fevereiro: R$ 1200, Março: R$ 900')).toBeInTheDocument();
  });

  it('should not render data section when data is not provided', () => {
    render(
      <ChartDescription 
        id="chart-desc-1"
        title="Despesas Mensais"
        description="Gráfico de barras mostrando despesas mensais ao longo do ano"
      />
    );
    
    expect(screen.queryByText('Dados do gráfico:')).not.toBeInTheDocument();
  });
});

describe('ChartDataTable Accessibility', () => {
  const headers = ['Mês', 'Receitas', 'Despesas', 'Saldo'];
  const rows = [
    ['Janeiro', 'R$ 5000', 'R$ 3000', 'R$ 2000'],
    ['Fevereiro', 'R$ 5500', 'R$ 3200', 'R$ 2300'],
    ['Março', 'R$ 4800', 'R$ 3500', 'R$ 1300']
  ];

  it('should have no accessibility violations', async () => {
    await testAccessibility(
      <ChartDataTable 
        id="chart-table-1"
        title="Resumo Financeiro Trimestral"
        headers={headers}
        rows={rows}
      />
    );
  });

  it('should render with correct attributes for screen readers', () => {
    render(
      <ChartDataTable 
        id="chart-table-1"
        title="Resumo Financeiro Trimestral"
        headers={headers}
        rows={rows}
      />
    );
    
    const container = screen.getByText('Resumo Financeiro Trimestral').closest('div');
    expect(container).toHaveAttribute('id', 'chart-table-1');
    expect(container).toHaveClass('sr-only');
    expect(container).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render table with caption', () => {
    render(
      <ChartDataTable 
        id="chart-table-1"
        title="Resumo Financeiro Trimestral"
        headers={headers}
        rows={rows}
      />
    );
    
    expect(screen.getByText('Resumo Financeiro Trimestral')).toBeInTheDocument();
  });

  it('should render table headers correctly', () => {
    render(
      <ChartDataTable 
        id="chart-table-1"
        title="Resumo Financeiro Trimestral"
        headers={headers}
        rows={rows}
      />
    );
    
    headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('should render table rows correctly', () => {
    render(
      <ChartDataTable 
        id="chart-table-1"
        title="Resumo Financeiro Trimestral"
        headers={headers}
        rows={rows}
      />
    );
    
    rows.flat().forEach(cell => {
      expect(screen.getByText(cell)).toBeInTheDocument();
    });
  });
});