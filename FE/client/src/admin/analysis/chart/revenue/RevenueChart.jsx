import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

const RevenueByMonth = () => {
  const svgRef = useRef();
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);

  const fetchData = async (selectedYear) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/analysis/revenue/by-time?year=${selectedYear}`);
      setData(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData(year);
  }, [year]);

  useEffect(() => {
    if (!data.length) return;

    const margin = { top: 50, right: 30, bottom: 50, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .selectAll('*')
      .remove();

    const chart = d3
      .select(svgRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.revenue) || 0])
      .nice()
      .range([height, 0]);

    chart
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => d3.timeFormat('%b')(new Date(2000, d - 1)))
      )
      .selectAll('text')
      .attr('transform', 'rotate(-40)')
      .style('text-anchor', 'end');

    chart.append('g').call(d3.axisLeft(y));

    chart
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.month))
      .attr('y', (d) => y(d.revenue))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.revenue))
      .attr('fill', '#4682B4');

    // Title
    chart
      .append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`Monthly Revenue for ${year}`);
  }, [data]);

  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Revenue by Month</h3>
      <label>
        Select Year:{' '}
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RevenueByMonth;
