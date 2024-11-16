import * as d3 from 'd3';
import utils from '../common';
import Tooltip from '../Tooltip/Tooltip';

class ScatterplotD3 {
    margin = { top: 10, right: 10, bottom: 40, left: 60 };
    size;
    height;
    width;
    svg;
    defaultOpacity = .3;
    transitionDuration = 5000;
    circleRadius = 2;
    xScale;
    yScale;
    seasonColorScale;
    holydaySymbolScale;

    constructor(el) {
        this.el = el;
    }

    create = function (config) {
        this.size = { width: config.size.width, height: config.size.height };

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.svg = d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class", "svgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.yScale = d3.scaleLinear().range([this.height, 0]);
        this.seasonColorScale = utils.seasonColorScale
        this.holydaySymbolScale = utils.holydaySymbolScale

        const xAxisGroup = this.svg.append("g")
            .attr("class", "xAxisG")
            .attr("transform", "translate(0," + this.height + ")");

        xAxisGroup.append("text")
            .attr("class", "xAxisLabel")
            .attr("x", this.width / 2)
            .attr("y", this.margin.bottom - 10)
            .attr("fill", "black")
            .style("text-anchor", "middle")

        const yAxisGroup = this.svg.append("g")
            .attr("class", "yAxisG");

        yAxisGroup.append("text")
            .attr("class", "yAxisLabel")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -this.margin.left + 20)
            .attr("fill", "black")
            .style("text-anchor", "middle");

                    
        this.svg.append("g")
            .attr("class", "brushG");
            
        this.allDotsG = this.svg.append("g")
            .attr("class", "allDotsG");

        this.tooltipdiv = d3.select("body").select(".tooltip-div");

    //     this.tooltipdiv = d3.select("body").append("div")
    //         .attr("class", "tooltip-div")
    //         .style("opacity", 0)
    //         .style("position", "absolute");
    }

    updateDots(selection, xAttribute, yAttribute) {
        selection
            .transition().duration(this.transitionDuration)
            .attr("transform", (item) => {
                const xPos = this.xScale(item[xAttribute]);
                const yPos = this.yScale(item[yAttribute]);
                return "translate(" + xPos + "," + yPos + ")";
            })
            .select(".dotCircle");
    }

    updateAxis = function (visData, xAttribute, yAttribute) {
        const minX = d3.min(visData.map(item => item[xAttribute]));
        const maxX = d3.max(visData.map(item => item[xAttribute]));

        const minY = d3.min(visData.map(item => item[yAttribute]));
        const maxY = d3.max(visData.map(item => item[yAttribute]));

        if (xAttribute === "Date") {
            this.xScale = d3.scaleTime().range([0, this.width]);
            this.xScale.domain([new Date(minX), new Date(maxX)]);
        }
        else {
            this.xScale = d3.scaleLinear().range([0, this.width]);
            this.xScale.domain([minX, maxX]);
        }

        if (yAttribute === "Date") {
            this.yScale = d3.scaleTime().range([this.height, 0]);
            this.yScale.domain([new Date(minY), new Date(maxY)]);
        }
        else {
            this.yScale = d3.scaleLinear().range([this.height, 0]);
            this.yScale.domain([minY, maxY]);
        }

        // Update the x-axis
        this.svg.select(".xAxisG")
            .transition().duration(this.transitionDuration)
            .call(d3.axisBottom(this.xScale))

        // Update the y-axis
        this.svg.select(".yAxisG")
            .transition().duration(this.transitionDuration)
            .call(d3.axisLeft(this.yScale));

        this.svg.select(".xAxisLabel").text(xAttribute);
        this.svg.select(".yAxisLabel").text(yAttribute);
    }

    addBrush = function (onBrush) {
        const brush = d3.brush()
            .extent([[0, 0], [this.width, this.height]])
            .filter((e) => !e.ctrlKey && !e.button)
            .on("start end", (event) => {
                console.log(event)
                if (event.selection) {
                    const [[x0, y0], [x1, y1]] = event.selection;
                    const selectedData = this.svg.selectAll(".dotG").data().filter(d =>
                        x0 <= this.xScale(d[this.xAttribute]) && this.xScale(d[this.xAttribute]) <= x1 &&
                        y0 <= this.yScale(d[this.yAttribute]) && this.yScale(d[this.yAttribute]) <= y1
                    );
                    onBrush(selectedData);
                }}
            );
        this.svg.select(".brushG")
            .call(brush);
    }

    renderScatterplot = function (visData, xAttribute, yAttribute, controllerMethods) {
        if (!visData || !visData.length) return;
        this.updateAxis(visData, xAttribute, yAttribute);

        this.allDotsG.selectAll(".dotG")
            .data(visData, (itemData) => itemData.index)
            .join(
                enter => {
                    const self = this;
                    const itemG = enter.append("g")
                        .attr("class", "dotG")
                        .attr("opacity", this.defaultOpacity)
                        .on('mouseover', function (e, d) {
                            d3.select(this).style('stroke', 'black').style('stroke-width', '1').attr('opacity', '1');
                        })
                        .on('contextmenu', function (e, d) {
                            e.preventDefault();
                            const svgPosition = self.svg.node().getBoundingClientRect();
                            const pos = {
                                left: self.margin.left + svgPosition.left,
                                top : self.margin.top + svgPosition.top,
                            }
                            Tooltip.render_tooltip(d, this, pos);
                        })
                        .on('mouseout', function (e, d) {
                            d3.select(this).attr("opacity", self.defaultOpacity).style('stroke', 'none').style('stroke-width', '0');
                            self.tooltipdiv
                                .interrupt()
                                .transition()
                                .duration(300)
                                .style("opacity", 0);
                        });

                    itemG.append("path")
                        .attr("class", "dotCircle")
                        .attr("r", this.circleRadius)
                        .attr("fill", (item) => this.seasonColorScale(item.Seasons))
                        .attr("d", d3.symbol().type((item) => this.holydaySymbolScale(item.Holiday)))

                    this.updateDots(itemG, xAttribute, yAttribute);
                },
                update => this.updateDots(update, xAttribute, yAttribute),
                exit => exit.remove()
            );

        this.addBrush(controllerMethods.handleOnBrush);
    }

    clear = function () {
        d3.select(this.el).selectAll("*").remove();
    }
}

export default ScatterplotD3;