import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';

const SecondVisualizationContainer = () => {
  const data = useSelector(state => state.dataSet.data); // Access dataset from Redux
  const selectedItems = useSelector(state => state.dataSet.selectedItems); // Access selected items
  const svgRef = useRef();

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return; // Ensure data is an array

    // Filter out invalid data points (e.g., missing or NaN values)
    const validData = data.filter(d => d.RentedBikeCount !== undefined && !isNaN(d.RentedBikeCount));

    const svg = d3.select(svgRef.current);
    const width = 500;
    const height = 300;

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(validData.map(d => d.index)) // Use validData here
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(validData, d => d.RentedBikeCount)]) // Use validData here
      .range([height, 0]); // Invert range for correct orientation

    // Clear previous content
    svg.selectAll("*").remove();

    // Add bars for each valid data point
    svg.selectAll("rect")
      .data(validData) // Use validData here
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.index))
      .attr("y", d => yScale(d.RentedBikeCount)) // y position based on scaled value
      .attr("width", xScale.bandwidth())
      .attr("height", d => {
        const barHeight = height - yScale(d.RentedBikeCount); // Calculate height correctly
        return isNaN(barHeight) ? 0 : barHeight; // Ensure no NaN heights are passed
      })
      .attr("fill", "gray");

    // Highlight selected items in both visualizations
    svg.selectAll("rect")
      .filter(d => selectedItems.includes(d))
      .attr("fill", "orange");

  }, [data, selectedItems]);

  return <svg ref={svgRef} width={500} height={300}></svg>;
};

export default SecondVisualizationContainer;