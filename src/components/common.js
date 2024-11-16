import * as d3 from 'd3';

const utils = {
    seasonColorScale:  d3.scaleOrdinal()
        .domain(["Spring", "Summer", "Autumn", "Winter"])
        .range(["green", "red", "orange", "blue"]),

    holydaySymbolScale: d3.scaleOrdinal()
        .domain(["No Holiday", "Holiday"])
        .range([d3.symbolCircle, d3.symbolStar]),

    highLightElements: (self) => (selectedItems) => {
            if (selectedItems.length === 0) {
                self.allDotsG.selectAll(".dotG")
                .select(".dotCircle")
                .attr("fill", (item) => self.seasonColorScale(item.Seasons));
            } else {
                self.allDotsG.selectAll(".dotG")
                .select(".dotCircle")
                .attr("fill", "grey");
    
                selectedItems.forEach(item => {
                    self.allDotsG.selectAll(".dotG")
                        .filter(d => d.index === item.index)
                        .select(".dotCircle")
                        .attr("fill", (d) => self.seasonColorScale(d.Seasons));
                    });
            }
        }
}

export default utils;