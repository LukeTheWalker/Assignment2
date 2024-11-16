import * as d3 from 'd3';

const utils = {
    seasonColorScale:  d3.scaleOrdinal()
        .domain(["Spring", "Summer", "Autumn", "Winter"])
        .range(["green", "red", "orange", "blue"]),

    holydaySymbolScale: d3.scaleOrdinal()
        .domain(["No Holiday", "Holiday"])
        .range([d3.symbolCircle, d3.symbolStar])
}

export default utils;