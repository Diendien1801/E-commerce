import * as d3 from "d3";
import { useEffect, useRef } from "react";

const TopSelling = () => {
  const chartRef = useRef();

  useEffect(() => {
    fetch("http://localhost:5000/api/analysis/products/top-selling")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data.products.length) {
          const filtered = result.data.products
            .filter(p => p.productInfo && p.productInfo.title && p.productInfo.title !== "Unknown Product")
            .map(p => ({
                title: p.productInfo.title,
                quantity: p.salesData.totalQuantity,
            }));
          drawChart(filtered);
        }
      });

    function drawChart(data) {
      const svgWidth = 800;
      const svgHeight = 450;
      const margin = { top: 30, right: 30, bottom: 100, left: 60 };
      const width = svgWidth - margin.left - margin.right;
      const height = svgHeight - margin.top - margin.bottom;

      d3.select(chartRef.current).selectAll("*").remove();

      const svg = d3
        .select(chartRef.current)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // X-axis (product titles)
      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.title))
        .range([0, width])
        .padding(0.3);

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", null)
        .style("text-anchor", "end")
        .style("font-size", "12px");

      // Y-axis (quantities)
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.quantity)])
        .nice()
        .range([height, 0]);

      svg.append("g").call(d3.axisLeft(y)).style("font-size", "12px");

      // Bars
      svg
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.title))
        .attr("y", (d) => y(d.quantity))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - y(d.quantity))
        .attr("fill", "#69b3a2");

      // Labels
      svg
        .selectAll(".label")
        .data(data)
        .join("text")
        .attr("x", (d) => x(d.title) + x.bandwidth() / 2)
        .attr("y", (d) => y(d.quantity) - 5)
        .attr("text-anchor", "middle")
        .text((d) => d.quantity)
        .style("font-size", "11px");
    }
  }, []);

  return (
    <div
      ref={chartRef}
      style={{ width: "100%", overflowX: "auto", paddingBottom: "1rem" }}
    />
  );
};

export default TopSelling;
