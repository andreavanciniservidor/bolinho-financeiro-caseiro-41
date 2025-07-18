import React from 'react';

interface ChartDescriptionProps {
  /**
   * Título do gráfico
   */
  title: string;
  
  /**
   * Descrição detalhada do gráfico para leitores de tela
   */
  description: string;
  
  /**
   * Dados do gráfico em formato de texto para leitores de tela
   * Exemplo: "Janeiro: 1000, Fevereiro: 1200, Março: 900"
   */
  data?: string;
  
  /**
   * ID único para o gráfico
   */
  id: string;
  
  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Componente para adicionar descrições acessíveis a gráficos
 * Deve ser usado em conjunto com o atributo aria-describedby no elemento do gráfico
 */
export function ChartDescription({
  title,
  description,
  data,
  id,
  className
}: ChartDescriptionProps) {
  return (
    <div id={id} className="sr-only" aria-hidden="true">
      <h3>{title}</h3>
      <p>{description}</p>
      {data && (
        <div>
          <h4>Dados do gráfico:</h4>
          <p>{data}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Componente para adicionar uma tabela de dados acessível para gráficos
 */
interface ChartDataTableProps {
  /**
   * Título da tabela
   */
  title: string;
  
  /**
   * Cabeçalhos das colunas
   */
  headers: string[];
  
  /**
   * Dados da tabela
   * Cada item do array representa uma linha
   */
  rows: (string | number)[][];
  
  /**
   * ID único para a tabela
   */
  id: string;
  
  /**
   * Classe CSS adicional
   */
  className?: string;
}

export function ChartDataTable({
  title,
  headers,
  rows,
  id,
  className
}: ChartDataTableProps) {
  return (
    <div id={id} className="sr-only" aria-hidden="true">
      <table>
        <caption>{title}</caption>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} scope="col">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}