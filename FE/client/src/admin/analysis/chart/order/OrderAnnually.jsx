import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

const OrderAnnually = () => {
  const svgRef = useRef();
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);

  const fetchData = async (selectedYear) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/analysis/orders/time-stats?period=month&year=${selectedYear}`);
      setData(res.data.data?.ordersByTime || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData(year);
  }, [year]);

  useEffect(() => {
    if (!data.length) return;

    const margin = { top: 50, right: 30, bottom: 50, left: 60 };
    const width = 450;
    const height = 250;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + 300)
      .attr('height', height + 300);

    svg.selectAll('*').remove(); 

    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.periodData.month))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.totalOrders) || 1])
      .nice()
      .range([height, 0]);

    // X-axis
    chart
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .tickFormat((d) => d3.timeFormat('%b')(new Date(2000, d - 1)))
      )
      .selectAll('text')
      .attr('transform', 'rotate(-40)')
      .style('text-anchor', 'end');

    // Y-axis
    chart.append('g').call(d3.axisLeft(y));

    // Line
    const line = d3.line()
      .x((d) => x(d.periodData.month) + x.bandwidth() / 2)
      .y((d) => y(d.totalOrders));

    chart.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4682B4')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Dots
    chart.selectAll('.dot')
      .data(data)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.periodData.month) + x.bandwidth() / 2)
      .attr('cy', (d) => y(d.totalOrders))
      .attr('r', 5)
      .attr('fill', '#4682B4');

    // Labels above dots
    chart.selectAll('.dot-label')
      .data(data)
      .join('text')
      .attr('class', 'dot-label')
      .attr('x', (d) => x(d.periodData.month) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.totalOrders) - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#333')
      .text((d) => d.totalOrders);

    // Chart title
    chart.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
  }, [data]);

  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

  return (
    <div style={{ padding: '1rem' }}>
      <label>
        Select Year:{' '}
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default OrderAnnually;
