import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TopUser = () => {
  const chartRef = useRef();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analysis/top-spenders`)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data && Array.isArray(result.data)) {
          const data = result.data.map(user => ({
            name: user.name || user.fullName || user.email || 'Unknown',
            totalSpent: user.totalSpent || 0,
          }));
          drawChart(data);
        }
      });

    function drawChart(data) {
      const svgWidth = 500;
      const svgHeight = 400;
      const margin = { top: 30, right: 30, bottom: 100, left: 80 };
      const width = svgWidth - margin.left - margin.right;
      const height = svgHeight - margin.top - margin.bottom;

      d3.select(chartRef.current).selectAll('*').remove();

      const svg = d3
        .select(chartRef.current)
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // X axis (user names)
      const x = d3
        .scaleBand()
        .domain(data.map(d => d.name))
        .range([0, width])
        .padding(0.3);

      svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', '12px');

      // Y axis (total spent)
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.totalSpent)])
        .nice()
        .range([height, 0]);

      svg.append('g').call(d3.axisLeft(y)).style('font-size', '12px');

      // Color scale
      const color = d3.scaleOrdinal().domain(data.map(d => d.name)).range(d3.schemeCategory10);

      // Bars
      svg
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.totalSpent))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.totalSpent))
        .attr('fill', d => color(d.name));

      // Labels
      svg
        .selectAll('.bar-label')
        .data(data)
        .join('text')
        .attr('class', 'bar-label')
        .attr('x', d => x(d.name) + x.bandwidth() / 2)
        .attr('y', d => y(d.totalSpent) - 8)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#333')
        .text(d => d.totalSpent);
    }
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '350px',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
      }}
    />
  );
};

export default TopUser;
