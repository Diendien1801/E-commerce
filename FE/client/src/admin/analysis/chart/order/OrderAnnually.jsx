import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './annually.css';

const OrderAnnually = () => {
  const [data, setData] = useState([]);
  const [year, setYear] = useState(2024);
  const chartRef = useRef();

  useEffect(() => {
    fetchData(year);
  }, [year]);

  const fetchData = async (selectedYear) => {
    try {
      const res = await fetch(`http://localhost:5000/api/analysis/orders/analytics?year=${selectedYear}`);
      const json = await res.json();
      setData(json.data.statusBreakdown);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      drawChart();
    }
  }, [data]);

    const drawChart = () => {
        const svg = d3.select(chartRef.current);
        svg.selectAll('*').remove();

        const width = 600;
        const height = 400;
        const margin = { top: 40, right: 30, bottom: 50, left: 60 };

        const x = d3
            .scaleBand()
            .domain(data.map(d => d._id))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, d => d.count) || 1])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const color = d3.scaleOrdinal(d3.schemeSet2);

        svg
            .attr('viewBox', [0, 0, width, height])
            .classed('chart-svg', true);

        svg
            .append('g')
            .selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', d => x(d._id))
            .attr('y', d => y(d.count))
            .attr('height', d => y(0) - y(d.count))
            .attr('width', x.bandwidth())
            .attr('fill', d => color(d._id)); // ✅ moved here

        svg
            .append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(-30)')
            .style('text-anchor', 'end');

        svg
            .append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg
            .append('text')
            .attr('x', width / 2)
            .attr('y', margin.top / 2)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-title')
            .text(`Order Status Breakdown - ${year}`);
    };

  return (
    <div className="order-annually-container">
      <h2>Order Analysis by Year</h2>
      <div className="controls">
        <label>Select Year: </label>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {[2022, 2023, 2024, 2025].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <svg ref={chartRef}></svg>
    </div>
  );
};

export default OrderAnnually;
