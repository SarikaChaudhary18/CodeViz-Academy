import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true
  }
});

let idCounter = 0;

export default function Mermaid({ chart }) {
  const [error, setError] = useState(null);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    setError(null);
    if (!chart) return;

    idCounter++;
    const elementId = `mermaid-chart-${idCounter}`;

    const renderChart = async () => {
      try {
        let cleanChart = chart.trim();
        if (cleanChart.startsWith('```mermaid')) {
          cleanChart = cleanChart.slice(10);
        } else if (cleanChart.startsWith('```')) {
          cleanChart = cleanChart.slice(3);
        }
        if (cleanChart.endsWith('```')) {
          cleanChart = cleanChart.slice(0, -3);
        }
        cleanChart = cleanChart.trim();

        // Render diagram
        const { svg: renderedSvg } = await mermaid.render(elementId, cleanChart);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid render failure:', err);
        setError(err.message || 'Syntax error inside Mermaid diagram schema.');
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-left">
        <span className="text-[10px] font-mono text-red-500 font-bold uppercase block mb-1">Mermaid Syntax Graph</span>
        <pre className="text-[9px] font-mono text-zinc-600 overflow-x-auto whitespace-pre-wrap">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div 
      className="flex justify-center items-center w-full overflow-x-auto p-4 bg-zinc-50 border border-zinc-200 rounded-2xl min-h-[220px]"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
