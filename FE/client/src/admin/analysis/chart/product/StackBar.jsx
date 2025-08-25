import * as d3 from "d3";
import { useEffect, useRef } from "react";

const ProductCategory = () => {
  const chartRef = useRef();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analysis/products/categories`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          drawChart(result.data.stackChart);
        }
      });

    function drawChart(rawData) {
      const svgWidth = 350;
      const svgHeight = 350;
      const margin = { top: 30, right: 30, bottom: 60, left: 60 };
      const width = svgWidth - margin.left - margin.right;
      const height = svgHeight - margin.top - margin.bottom;

      // Clear existing chart
      d3.select(chartRef.current).selectAll("*").remove();

      const svg = d3
        .select(chartRef.current)
        .append("svg")
        .attr("width", svgWidth + 200)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Prepare data
      const parentNames = rawData.map((d) => d.parentName);
      const allSubcategories = Array.from(
        new Set(rawData.flatMap((d) => d.categories.map((c) => c.categoryName)))
      );

      const stackedData = rawData.map((parent) => {
        const row = { parentName: parent.parentName };
        allSubcategories.forEach((cat) => {
          const found = parent.categories.find((c) => c.categoryName === cat);
          row[cat] = found ? found.productCount : 0;
        });
        return row;
      });

      const color = d3
        .scaleOrdinal()
        .domain(allSubcategories)
        .range(d3.schemeTableau10);

      // X axis
      const x = d3
        .scaleBand()
        .domain(parentNames)
        .range([0, width])
        .padding(0.3);

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-20)")
        .style("text-anchor", "end")
        .style("font-size", "12px");

      // Y axis
      const y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(stackedData, (d) =>
            d3.sum(allSubcategories, (key) => d[key])
          ),
        ])
        .nice()
        .range([height, 0]);

      svg
        .append("g")
        .call(d3.axisLeft(y))
        .style("font-size", "12px");

      // Stack generator
      const stackGenerator = d3.stack().keys(allSubcategories);
      const layers = stackGenerator(stackedData);

      // Tooltip (append to body, styled like RevenueByCategory)
      const tooltip = d3
        .select('body')
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

      // Draw bars
      svg
        .selectAll("g.layer")
        .data(layers)
        .join("g")
        .attr("fill", (d) => color(d.key))
        .selectAll("rect")
        .data((d) => d)
        .join("rect")
        .attr("x", (d) => x(d.data.parentName))
        .attr("y", (d) => y(d[1]))
        .attr("height", (d) => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", (event, d) => {
          const category = event.currentTarget.parentNode.__data__.key;
          const value = d[1] - d[0];
          tooltip
            .style("visibility", "visible")
            .text(`${category}: ${value.toLocaleString()}`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY + 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseleave", () => tooltip.style("visibility", "hidden"));

        const legendSpacing = 18;

        const legend = svg
        .append("g")
        .attr("transform", `translate(${width + 20}, 0)`);

        legend
        .selectAll("rect")
        .data(allSubcategories)
        .enter()
        .append("rect")
        .attr("y", (_, i) => i * legendSpacing)
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", (d) => color(d));

        legend
        .selectAll("text")
        .data(allSubcategories)
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", (_, i) => i * legendSpacing + 11)
        .text((d) => d)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    }
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        position: "relative",
        width: "100%",
        overflowX: "auto",
        paddingBottom: "1rem",
      }}
    />
  );
};

export default ProductCategory;
