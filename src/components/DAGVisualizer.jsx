import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const nodes = [
  { id: 'A' },
  { id: 'B' },
  { id: 'C' },
  { id: 'D' },
];

const links = [
  { source: 'A', target: 'B' },
  { source: 'B', target: 'C' },
  { source: 'A', target: 'D' },
];

export default function DAGVisualizer() {
  const svgRef = useRef();

  useEffect(() => {
    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid #ccc');

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.selectAll('.link')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', '#aaa')
      .attr('stroke-width', 2);

    const node = svg.selectAll('.node')
      .data(nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', 20)
      .attr('fill', '#69b3a2')
      .call(
        d3.drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    const label = svg.selectAll('.label')
      .data(nodes)
      .enter().append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .text(d => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });
  }, []);

  return <svg ref={svgRef}></svg>;
}
