import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import axios from "axios";

const UserRegistration = () => {
  const svgRef = useRef();
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);

  const fetchData = async (year) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/analysis/registration-stats?period=month&year=${year}`
      );
      if (Array.isArray(res.data)) setData(res.data);
    } catch (error) {
      console.error("Fetch registration data error:", error);
    }
  };

  useEffect(() => {
    fetchData(year);
  }, [year]);

  useEffect(() => {
    if (!data.length) return;

    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove(); // Clear old chart

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Axis - Months
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, width])
      .padding(0.2);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => d3.timeFormat("%b")(new Date(2000, d - 1)))
      )
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end")
      .style("font-size", "12px");

    // Y Axis - Counts
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) || 0])
      .nice()
      .range([height, 0]);

    svg.append("g").call(d3.axisLeft(y)).style("font-size", "12px");

    // Bars
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.month))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count))
      .attr("fill", "#4682B4");

    // Labels
    svg
      .selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.month) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.count) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .text((d) => d.count);

    // Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`User Registrations by Month - ${year}`);
  }, [data]);

  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

  return (
    <div style={{ padding: "1rem" }}>
      <h3>User Registration Statistics</h3>
      <label>
        Select Year:{" "}
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
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

export default UserRegistration;
