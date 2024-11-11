import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useSelector, useDispatch } from 'react-redux';
import { updateSelectedItem } from '../redux/DataSetSlice';

const ScatterplotContainer = () => {
  const data = useSelector(state => state.dataSet.data); // Access the dataset from Redux
  const dispatch = useDispatch();
  const svgRef = useRef();

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return; // Ensure data is an array

    const svg = d3.select(svgRef.current);
    const width = 500;
    const height = 500;

    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.Temperature), d3.max(data, d => d.Temperature)])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.RentedBikeCount), d3.max(data, d => d.RentedBikeCount)])
      .range([height, 0]);

    // Clear previous content
    svg.selectAll("*").remove();

    // Add circles for each data point
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.Temperature))
      .attr("cy", d => yScale(d.RentedBikeCount))
      .attr("r", 5)
      .attr("fill", "blue");

    // Add brush
    const brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("brush end", (event) => {
        if (event.selection) {
          const [[x0, y0], [x1, y1]] = event.selection;
          const selectedData = data.filter(d =>
            x0 <= xScale(d.Temperature) && xScale(d.Temperature) <= x1 &&
            y0 <= yScale(d.RentedBikeCount) && yScale(d.RentedBikeCount) <= y1
          );
          dispatch(updateSelectedItem(selectedData));
        }
      });

    svg.append("g")
      .call(brush);

  }, [data, dispatch]);

  return <svg ref={svgRef} width={500} height={500}></svg>;
};

export default ScatterplotContainer;