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
      const svgWidth = 350;
      const svgHeight = 350;
      const margin = { top: 30, right: 30, bottom: 100, left: 60 };
      const width = svgWidth - margin.left - margin.right;
      const height = svgHeight - margin.top - margin.bottom;

      d3.select(chartRef.current).selectAll("*").remove();

      const svg = d3
        .select(chartRef.current)
        .append("svg")
        .attr("width", svgWidth + 450)
        .attr("height", svgHeight + 310)
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
        .attr("transform", "rotate(-90)") 
        .style("text-anchor", "end")
        .style("font-size", "1px")
        .remove();

      // Y-axis (quantities)
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.quantity)])
        .nice()
        .range([height, 0]);

      svg.append("g").call(d3.axisLeft(y)).style("font-size", "12px");

      // Color scale for bars
      const color = d3.scaleOrdinal()
        .domain(data.map((d) => d.title))
        .range(d3.schemeCategory10);

      // Bars
      svg
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.title))
        .attr("y", (d) => y(d.quantity))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - y(d.quantity))
        .attr("fill", (d) => color(d.title));

      // Count label above each bar
      svg
        .selectAll(".bar-label")
        .data(data)
        .join("text")
        .attr("class", "bar-label")
        .attr("x", (d) => x(d.title) + x.bandwidth() / 2)
        .attr("y", (d) => y(d.quantity) - 8)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#333")
        .text((d) => d.quantity);

      // Add legend similar to TopStock
      const legendSpacing = 18;
      const legend = svg
        .append("g")
        .attr("transform", `translate(${width + 20}, 0)`);  // shift to the right of chart

      legend
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", (_, i) => i * legendSpacing)
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", (d) => color(d.title));

      legend
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", (_, i) => i * legendSpacing + 11)
        .text((d) => d.title)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
        
    }
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
      width: "100%",
      height: "350px", 
      overflowX: "auto",
      overflowY: "hidden",
      paddingBottom: "0.5rem" 
    }}
    />
  );
};

export default TopSelling;
