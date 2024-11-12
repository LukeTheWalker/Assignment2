import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { renderBarChart } from './SecondVisualizationRender'; // Import the D3 utility

const SecondVisualizationContainer = () => {
  const data = useSelector(state => state.dataSet.data);
  const selectedItems = useSelector(state => state.dataSet.selectedItems);
  const svgRef = useRef();

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    // Call D3 render function with filtered data and selected items
    renderBarChart(svgRef.current, data, selectedItems);
    
  }, [data, selectedItems]);

  return <svg ref={svgRef} style={{ width: "100%", height: "100%", margin: "10px", boxSizing: "border-box" }}></svg>;
};

export default SecondVisualizationContainer;