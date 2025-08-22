

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const RevenueByCategory = () => {
	const chartRef = useRef();
	const [year, setYear] = useState(new Date().getFullYear());
	const [rawData, setRawData] = useState([]);

	// Fetch and parse API data
	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch(`http://localhost:5000/api/analysis/revenue/by-category?year=${year}`);
				const result = await res.json();
				if (result.success && Array.isArray(result.data) && result.data.length > 0) {
					setRawData(result.data[0].parents || []);
				} else {
					setRawData([]);
				}
			} catch (err) {
				setRawData([]);
			}
		};
		fetchData();
	}, [year]);

	useEffect(() => {
		if (!rawData.length) return;

		// Prepare stacked data
		const parentNames = rawData.map(p => p.parentName || 'Unknown');
		const allCategories = Array.from(new Set(rawData.flatMap(p => p.children.map(c => c.categoryName || 'Unknown'))));

		const stackedData = rawData.map(parent => {
			const row = { parentName: parent.parentName || 'Unknown' };
			allCategories.forEach(cat => {
				const found = parent.children.find(c => c.categoryName === cat);
				row[cat] = found ? found.totalRevenue : 0;
			});
			return row;
		});

		// Chart dimensions
		const svgWidth = 450;
		const svgHeight = 320;
		const margin = { top: 40, right: 120, bottom: 60, left: 60 };
		const width = svgWidth - margin.left - margin.right;
		const height = svgHeight - margin.top - margin.bottom;

		// Clear chart
		d3.select(chartRef.current).selectAll('*').remove();

		const svg = d3.select(chartRef.current)
			.append('svg')
			.attr('width', svgWidth)
			.attr('height', svgHeight)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// X axis
		const x = d3.scaleBand()
			.domain(parentNames)
			.range([0, width])
			.padding(0.3);

		svg.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x))
			.selectAll('text')
			.attr('transform', 'rotate(-20)')
			.style('text-anchor', 'end')
			.style('font-size', '12px');

		// Y axis
		const y = d3.scaleLinear()
			.domain([
				0,
				d3.max(stackedData, d => d3.sum(allCategories, key => d[key]))
			])
			.nice()
			.range([height, 0]);

		svg.append('g')
			.call(d3.axisLeft(y))
			.style('font-size', '12px');

		// Stack generator
		const stackGenerator = d3.stack().keys(allCategories);
		const layers = stackGenerator(stackedData);

		// Color scale
		const color = d3.scaleOrdinal().domain(allCategories).range(d3.schemeTableau10);

		// Tooltip -> append vào body
		const tooltip = d3.select('body')
		.append('div')
		.style('position', 'absolute')
		.style('visibility', 'hidden')
		.style('background', '#fff')
		.style('border', '1px solid #ccc')
		.style('padding', '6px 10px')
		.style('border-radius', '4px')
		.style('font-size', '13px')
		.style('pointer-events', 'none')
		.style('box-shadow', '0px 2px 6px rgba(0,0,0,0.1)');

		// Vẽ rect + gắn tooltip
		svg.selectAll('g.layer')
		.data(layers)
		.join('g')
		.attr('fill', d => color(d.key))
		.selectAll('rect')
		.data(d => d)
		.join('rect')
		.attr('x', d => x(d.data.parentName))
		.attr('y', d => y(d[1]))
		.attr('height', d => y(d[0]) - y(d[1]))
		.attr('width', x.bandwidth())
		.on('mouseover', (event, d) => {
			const category = event.currentTarget.parentNode.__data__.key;
			const value = d[1] - d[0];
			tooltip
			.style('visibility', 'visible')
			.text(`${category}: ${value.toLocaleString()}`);
		})
		.on('mousemove', (event) => {
			// Dùng pageX/pageY thay vì pointer relative
			tooltip
			.style('top', `${event.pageY + 10}px`)
			.style('left', `${event.pageX + 10}px`);
		})
		.on('mouseleave', () => tooltip.style('visibility', 'hidden'));


		// Legend
		const legendSpacing = 18;
		const legend = svg.append('g').attr('transform', `translate(${width + 20}, 0)`);
		legend.selectAll('rect')
			.data(allCategories)
			.enter()
			.append('rect')
			.attr('y', (_, i) => i * legendSpacing)
			.attr('width', 14)
			.attr('height', 14)
			.attr('fill', d => color(d));
		legend.selectAll('text')
			.data(allCategories)
			.enter()
			.append('text')
			.attr('x', 20)
			.attr('y', (_, i) => i * legendSpacing + 11)
			.text(d => d)
			.style('font-size', '12px')
			.attr('alignment-baseline', 'middle');

		// Title
		svg.append('text')
			.attr('x', width / 2)
			.attr('y', -20)
			.attr('text-anchor', 'middle')
			.style('font-size', '16px')
			.style('font-weight', 'bold')
			.text('Revenue by Category (Stacked)');
	}, [rawData]);

	const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

	return (
		<div style={{ padding: '1rem' }}>
			<label>
				Select Year:{' '}
				<select value={year} onChange={e => setYear(e.target.value)}>
					{years.map(y => (
						<option key={y} value={y}>{y}</option>
					))}
				</select>
			</label>
			<div ref={chartRef}></div>
		</div>
	);
};

export default RevenueByCategory;
