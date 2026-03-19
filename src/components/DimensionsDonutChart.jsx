import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const CHART_DATA = [
  { label: 'Espacios verdes', value: 15, color: '#FEBE00' },
  { label: 'Salud', value: 33, color: '#09A9E7' },
  { label: 'Contexto socioeconómico', value: 25, color: '#86898B' },
  { label: 'Educación', value: 27, color: '#FD4E51' },
];

export default function DimensionsDonutChart() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    const width = 980;
    const height = 560;
    const cx = width / 2;
    const cy = height / 2 + 10;
    const outerRadius = 145;
    const innerRadius = 115;
    const midRadius = (innerRadius + outerRadius) / 2;
    const arcDuration = 650;
    const arcDelay = 500;
    const lineColor = '#DADCDD';

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const chartGroup = svg.append('g').attr('transform', `translate(${cx}, ${cy})`);

    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null);

    const arcsData = pie(CHART_DATA);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

    const paths = chartGroup
      .selectAll('path')
      .data(arcsData)
      .enter()
      .append('path')
      .attr('fill', (d) => d.data.color)
      .attr('d', (d) => arc({ ...d, endAngle: d.startAngle }))
      // .attr('stroke', '#ffffff')
      // .attr('stroke-width', 2);

    paths
      .transition()
      .duration(arcDuration)
      .delay((_, i) => i * arcDelay)
      .ease(d3.easeCubicOut)
      .attrTween('d', function attrTweenEndAngle(d) {
        const interpolate = d3.interpolate(d.startAngle, d.endAngle);
        return function tween(t) {
          return arc({ ...d, endAngle: interpolate(t) });
        };
      });

    const totalArcsAnimation = (CHART_DATA.length - 1) * arcDelay + arcDuration;

    const refsGroup = svg.append('g');
    const referencePoints = arcsData.map((d) => {
      const angle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
      const targetX = cx + Math.cos(angle) * midRadius;
      const targetY = cy + Math.sin(angle) * midRadius;
      const isRight = targetX >= cx;
      const labelX = isRight ? width - 150 : 150;
      const anchor = isRight ? 'end' : 'start';

      return {
        ...d,
        targetX,
        targetY,
        isRight,
        labelX,
        anchor,
      };
    });

    refsGroup
      .selectAll('line')
      .data(referencePoints)
      .enter()
      .append('line')
      .attr('x1', (d) => d.labelX)
      .attr('x2', (d) => d.labelX)
      .attr('y1', (d) => d.targetY)
      .attr('y2', (d) => d.targetY)
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .transition()
      .delay(totalArcsAnimation + 120)
      .duration(420)
      .ease(d3.easeCubicOut)
      .attr('opacity', 1)
      .attr('x2', (d) => d.targetX);

    refsGroup
      .selectAll('circle')
      .data(referencePoints)
      .enter()
      .append('circle')
      .attr('cx', (d) => d.targetX)
      .attr('cy', (d) => d.targetY)
      .attr('r', 0)
      .attr('fill', lineColor)
      .transition()
      .delay(totalArcsAnimation + 350)
      .duration(260)
      .ease(d3.easeCubicOut)
      .attr('r', 3);

    refsGroup
      .selectAll('text.ref-label-main')
      .data(referencePoints)
      .enter()
      .append('text')
      .attr('class', 'ref-label-main')
      .attr('x', (d) => d.labelX)
      .attr('y', (d) => d.targetY - 65)
      .attr('text-anchor', (d) => d.anchor)
      .attr('fill', '#666666')
      .attr('font-size', 15)
      .attr('font-weight', 300)
      .attr('opacity', 0)
      .text((d) => d.data.label)
      .transition()
      .delay(totalArcsAnimation + 420)
      .duration(280)
      .attr('opacity', 1);

    refsGroup
      .selectAll('text.ref-label-value')
      .data(referencePoints)
      .enter()
      .append('text')
      .attr('class', 'ref-label-value')
      .attr('x', (d) => d.labelX)
      .attr('y', (d) => d.targetY - 20)
      .attr('text-anchor', (d) => d.anchor)
      .attr('fill', '#003087')
      .attr('font-size', 36)
      .attr('font-weight', 700)
      .attr('opacity', 0)
      .text((d) => `${d.data.value}%`)
      .transition()
      .delay(totalArcsAnimation + 500)
      .duration(280)
      .attr('opacity', 1);
  }, [isVisible]);

  return (
    <div ref={containerRef} className="w-full mt-16">
      <h3 className="text-lg text-black text-center">
        <b>Gráfico N°1:</b> Porcentaje de ponderación por dimensión de análisis
      </h3>
      <div className="mt-6 w-full">
        <svg ref={svgRef} className="w-full h-auto max-h-[580px]" />
      </div>
      <p className="text-lg text-black/80 text-center mt-3 pb-24">
        Fuente: elaboración propia.
      </p>
    </div>
  );
}
