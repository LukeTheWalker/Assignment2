import * as d3 from 'd3';
import gear_svg from '../img/gear';

const utils = {
    seasonColorScale:  d3.scaleOrdinal()
        .domain(["Spring", "Summer", "Autumn", "Winter"])
        .range([d3.color("#abdda4"), d3.color("#2b83ba"), d3.color("#fdae61"), d3.color("#d7191c")]),

    holydaySymbolScale: d3.scaleOrdinal()
        .domain(["No Holiday", "Holiday"])
        .range([d3.symbolCircle, d3.symbolStar]),

    createLegend: (self) => () => {
        // Move the legend group to the top-left corner
        const legendSvgWidth = self.legendSvg.node().getBoundingClientRect().width;
        const legendSvgHeight = self.legendSvg.node().getBoundingClientRect().height;

        const totalLegendItems = self.seasonColorScale.domain().length;
        const totalLegendWidth = totalLegendItems * 80;

        self.legend.attr("transform", "translate(" + (legendSvgWidth - totalLegendWidth) / 2 + ", " + legendSvgHeight / 4 + ")"); 

        const legend = self.legend.selectAll(".legendItem")
            .data(self.seasonColorScale.domain())
            .join("g")
            .attr("class", "legendItem")
            .attr("transform", (d, i) => "translate(" + i * 90 + ", 5)");

        // circle
        legend.append("path")
            .attr("d", d3.symbol().type(d3.symbolCircle).size(64))
            .attr("fill", self.seasonColorScale)
            .attr("opacity", self.defaultOpacity);

        legend.append("text")
            .attr("x", 15)
            .attr("y", 5)
            .text(d => d.toLowerCase())
            .attr("fill", "black")
            .style("text-anchor", "start");

        // star
        const star = self.legend
            .append("g")
            .attr("transform", "translate(90, 15)");

        star.append("path")
            .attr("d", d3.symbol().type(d3.symbolStar).size(64))
            .attr("fill", "black")
            .attr("transform", "translate(0, 10)");

        star.append("text")
            .attr("x", 15)
            .attr("y", 14)
            .text("holiday")
            .attr("fill", "black")
            .style("text-anchor", "start");

        // gear
        const gear = self.legend
            .append("g")
            .attr("transform", "translate(171, 15)");
            
        gear.append("path")
            .attr("d", gear_svg)
            .attr("fill", "black")
            .attr("transform", "scale(0.05)");

        gear.append("text")
            .attr("x", 25)
            .attr("y", 14)
            .text("broken")
            .attr("fill", "black")
            .style("text-anchor", "start");

        }, 
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