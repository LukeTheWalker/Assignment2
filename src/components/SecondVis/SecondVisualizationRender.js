import * as d3 from 'd3';

// D3 bar chart rendering function
export function renderBarChart(svgElement, data, selectedItems) {
  const svg = d3.select(svgElement)

  // get height from svg element
  const height = svgElement.clientHeight;
  const width = svgElement.clientWidth;

  // Set up scales
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.index))
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.RentedBikeCount)])
    .range([height, 0]);

  // Clear previous content
  svg.selectAll("*").remove();

  // Add bars for each data point
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.index))
    .attr("y", d => yScale(d.RentedBikeCount))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(d.RentedBikeCount))
    .attr("fill", "gray");

  // Highlight selected items in both visualizations
  svg.selectAll("rect")
    .filter(d => selectedItems.includes(d))
    .attr("fill", "orange");
}