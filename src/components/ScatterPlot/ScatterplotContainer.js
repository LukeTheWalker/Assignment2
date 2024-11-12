import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateSelectedItem } from '../../redux/DataSetSlice';
import { renderScatterplot } from './ScatterPlotRender'; // Import the D3 utility

const ScatterplotContainer = () => {
  const data = useSelector(state => state.dataSet.data);
  const dispatch = useDispatch();
  const svgRef = useRef();

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    // Call D3 render function and pass a callback for brush selection
    renderScatterplot(svgRef.current, data, (selectedData) => {
      dispatch(updateSelectedItem(selectedData));
    });
    
  }, [data, dispatch]);

  return <svg ref={svgRef} style={{ width: "100%", height: "100%", margin: "10px", boxSizing: "border-box" }}></svg>;
};

export default ScatterplotContainer;