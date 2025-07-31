import * as d3 from "d3";
import { useEffect } from "react";

const OrderStatus = () => {
  useEffect(() => {
    fetch("http://localhost:5000/api/analysis/orders/status")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          drawChart(result.data.statusBreakdown);
        }
      });

    function drawChart(data) {
  d3.select("#chart").selectAll("*").remove();

  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.status))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Tooltip div
  const tooltip = d3
    .select("#chart")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.1)");

  // Bars
  svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d) => x(d.status))
    .attr("y", (d) => y(d.count))
    .attr("height", (d) => y(0) - y(d.count))
    .attr("width", x.bandwidth())
    .attr("fill", "#69b3a2")
    .on("mouseover", (event, d) => {
      tooltip
        .style("visibility", "visible")
        .text(`Count: ${parseInt(d.count)}`);
      d3.select(event.currentTarget).attr("fill", "#4682b4");
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", event.pageY - 250 + "px")
        .style("left", event.pageX + "px");
    })
    .on("mouseleave", (event) => {
      tooltip.style("visibility", "hidden");
      d3.select(event.currentTarget).attr("fill", "#69b3a2");
    });

  // X Axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  // Y Axis
  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
}
  }, []);

  return <div id="chart" style={{ position: "relative" }}></div>;
};

export default OrderStatus;
