import * as d3 from 'd3';

// D3 scatterplot rendering function
export function renderScatterplot(svgElement, data, onBrush) {
  console.log("Rendering Scatterplot");

  const svg = d3.select(svgElement)
  .append("g")
  .attr("transform", "translate(50, 50)");

  // get height from svg element
  const height = svgElement.clientHeight;
  const width  = svgElement.clientWidth   ;

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
    .attr("r", 2)
    .attr("fill", "black")
    .attr("opacity", 0.3);

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(yScale));

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
        onBrush(selectedData); // Pass selected data to React via callback
      }
    });

  svg.append("g")
    .call(brush);
}