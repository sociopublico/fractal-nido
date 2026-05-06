import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useMediaQuery } from '../hooks/useMediaQuery';

const CHART_DATA = [
  { label: 'Espacios verdes', value: 15, color: '#0FBC02' },
  { label: 'Salud', value: 33, color: '#09A9E7' },
  { label: 'Contexto socioeconómico', value: 25, color: '#86898B' },
  { label: 'Educación', value: 27, color: '#FD4E51' },
];

export default function DimensionsDonutChart() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

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

    const width = isMobile ? 420 : 980;
    const height = isMobile ? 720 : 560;
    const cx = width / 2;
    const cy = isMobile ? height / 2 : height / 2 + 10;
    const outerRadius = isMobile ? 174 : 145;
    const innerRadius = isMobile ? 132 : 115;
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
    const mobileLabelSlots = {
      'Educación': { x: width * 0.24, y: 88, anchor: 'middle' },
      'Espacios verdes': { x: width * 0.76, y: 88, anchor: 'middle' },
      'Contexto socioeconómico': { x: width * 0.24, y: height - 92, anchor: 'middle' },
      Salud: { x: width * 0.76, y: height - 92, anchor: 'middle' },
    };

    /** Intersección del círculo del donut (midRadius) con la vertical x = lineX. */
    const ringYAtX = (lineX, upperHalf) => {
      const dx = lineX - cx;
      const disc = midRadius * midRadius - dx * dx;
      if (disc < 0) return cy;
      const s = Math.sqrt(disc);
      return upperHalf ? cy - s : cy + s;
    };

    const referencePoints = arcsData.map((d) => {
      const angle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
      const targetX = cx + Math.cos(angle) * midRadius;
      const targetY = cy + Math.sin(angle) * midRadius;

      if (isMobile) {
        const slot = mobileLabelSlots[d.data.label];
        const labelX = slot?.x ?? cx;
        const labelY = slot?.y ?? cy;
        const slotIsTop = labelY < cy;
        const ringY = ringYAtX(labelX, slotIsTop);
        const mainY = labelY + (slotIsTop ? -8 : 8);
        const valueY = labelY + (slotIsTop ? 28 : 36);
        /** Línea solo vertical: x fijo; arriba empieza debajo del %. */
        let lineY1;
        let lineY2;
        if (slotIsTop) {
          const belowValueY = valueY + 26;
          lineY1 = Math.min(belowValueY, ringY);
          lineY2 = Math.max(belowValueY, ringY);
        } else {
          const aboveBlockY = labelY - 10;
          lineY1 = Math.min(ringY, aboveBlockY);
          lineY2 = Math.max(ringY, aboveBlockY);
        }
        return {
          ...d,
          targetX: labelX,
          targetY: ringY,
          labelX,
          labelY,
          anchor: slot?.anchor ?? 'middle',
          isTop: slotIsTop,
          mainY,
          valueY,
          lineY1,
          lineY2,
        };
      }

      const isRight = targetX >= cx;
      return {
        ...d,
        targetX,
        targetY,
        labelX: isRight ? width - 150 : 150,
        labelY: targetY,
        anchor: isRight ? 'end' : 'start',
        isTop: targetY < cy,
      };
    });

    const lineSelection = refsGroup
      .selectAll('line')
      .data(referencePoints)
      .enter()
      .append('line')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('opacity', 0);

    if (isMobile) {
      lineSelection
        .attr('x1', (d) => d.labelX)
        .attr('x2', (d) => d.labelX)
        .attr('y1', (d) => d.lineY1)
        .attr('y2', (d) => d.lineY2)
        .transition()
        .delay(totalArcsAnimation + 120)
        .duration(420)
        .ease(d3.easeCubicOut)
        .attr('opacity', 1);
    } else {
      lineSelection
        .attr('x1', (d) => d.labelX)
        .attr('x2', (d) => d.labelX)
        .attr('y1', (d) => d.labelY)
        .attr('y2', (d) => d.targetY)
        .transition()
        .delay(totalArcsAnimation + 120)
        .duration(420)
        .ease(d3.easeCubicOut)
        .attr('opacity', 1)
        .attr('x2', (d) => d.targetX);
    }

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
      .attr('y', (d) => (isMobile ? d.mainY : d.labelY - 65))
      .attr('text-anchor', (d) => d.anchor)
      .attr('fill', '#666666')
      .attr('font-size', isMobile ? 14 : 15)
      .attr('font-weight', 300)
      .attr('dominant-baseline', (d) => (isMobile ? (d.isTop ? 'auto' : 'hanging') : 'auto'))
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
      .attr('y', (d) => (isMobile ? d.valueY : d.labelY - 20))
      .attr('text-anchor', (d) => d.anchor)
      .attr('fill', '#003087')
      .attr('font-size', isMobile ? 30 : 36)
      .attr('font-weight', 700)
      .attr('dominant-baseline', (d) => (isMobile ? (d.isTop ? 'auto' : 'hanging') : 'auto'))
      .attr('opacity', 0)
      .text((d) => `${d.data.value}%`)
      .transition()
      .delay(totalArcsAnimation + 500)
      .duration(280)
      .attr('opacity', 1);

    const HOVER_OFFSET = 10;

    paths
      .style('cursor', 'pointer')
      .on('mouseenter', function (_event, d) {
        const midAngle = (d.startAngle + d.endAngle) / 2;
        const tx = Math.sin(midAngle) * HOVER_OFFSET;
        const ty = -Math.cos(midAngle) * HOVER_OFFSET;
        const idx = arcsData.indexOf(d);

        paths.transition().duration(160)
          .attr('opacity', 0.25)
          .attr('transform', 'translate(0,0)');

        d3.select(this).transition().duration(160)
          .attr('opacity', 1)
          .attr('transform', `translate(${tx},${ty})`);

        refsGroup.selectAll('text, line, circle')
          .transition().duration(160)
          .attr('opacity', 0.15);

        refsGroup.selectAll('text, line, circle')
          .filter((ld) => ld === referencePoints[idx])
          .transition().duration(160)
          .attr('opacity', 1);
      })
      .on('mouseleave', function () {
        paths.transition().duration(200)
          .attr('opacity', 1)
          .attr('transform', 'translate(0,0)');

        refsGroup.selectAll('text, line, circle')
          .transition().duration(200)
          .attr('opacity', 1);
      });
  }, [isVisible, isMobile]);

  return (
    <div ref={containerRef} className="w-full mt-16">
      <div className={`${isMobile ? 'mt-0' : '-mt-12'} w-full`}>
        <svg ref={svgRef} className={`w-full h-auto ${isMobile ? 'max-h-[760px]' : 'max-h-[580px]'}`} />
      </div>
    </div>
  );
}
