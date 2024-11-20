import * as d3 from 'd3';
import utils from '../common';
import Tooltip from '../Tooltip/Tooltip';
import { filterInRectFromQuadtree } from 'vis-utils';
import gear_svg from '../../img/gear';

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

    focused;
    toolTipFading = false;

    constructor(el) {
        this.el = el;
    }

    create = function (config) {
        this.size = { width: config.size.width, height: config.size.height };

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.svg = d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);
        this.svgG = this.svg.append("g")
            .attr("class", "svgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.yScale = d3.scaleLinear().range([this.height, 0]);
        this.seasonColorScale = utils.seasonColorScale
        this.holydaySymbolScale = utils.holydaySymbolScale

        const xAxisGroup = this.svgG.append("g")
            .attr("class", "xAxisG")
            .attr("transform", "translate(0," + this.height + ")");

        xAxisGroup.append("text")
            .attr("class", "xAxisLabel")
            .attr("x", this.width / 2)
            .attr("y", this.margin.bottom - 10)
            .attr("fill", "black")
            .style("text-anchor", "middle")

        const yAxisGroup = this.svgG.append("g")
            .attr("class", "yAxisG");

        yAxisGroup.append("text")
            .attr("class", "yAxisLabel")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -this.margin.left + 20)
            .attr("fill", "black")
            .style("text-anchor", "middle");
                                
        this.allDotsG = this.svgG.append("g")
            .attr("class", "allDotsG");

        this.svgG.append("g")
            .attr("class", "brushG");

        this.svgPosition = {
            left: this.margin.left + this.svg.node().getBoundingClientRect().left,
            top : this.margin.top  + this.svg.node().getBoundingClientRect().top,
        } 

        this.tooltipdiv = d3.select("body").select(".tooltip-div");
    }

    updateDots = function (selection, xAttribute, yAttribute) {
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
        this.svgG.select(".xAxisG")
            .transition().duration(this.transitionDuration)
            .call(d3.axisBottom(this.xScale))

        // Update the y-axis
        this.svgG.select(".yAxisG")
            .transition().duration(this.transitionDuration)
            .call(d3.axisLeft(this.yScale));

        this.svgG.select(".xAxisLabel").text(xAttribute);
        this.svgG.select(".yAxisLabel").text(yAttribute);
    }

    addBrush = function (onBrush, xAttribute, yAttribute) {
        const self = this;
        const brush = d3.brush()
            .extent([[-20, 0], [this.width, this.height+20]])
            .on("start brush end", (event) => {
                if (event.type === "start") 
                    d3.selectAll(".brushG").selectAll(".selection").style("display", "none");

                if (event.selection) {
                    const selectedData = filterInRectFromQuadtree(this.quadtree, event.selection, d => this.xScale(d[xAttribute]), d => this.yScale(d[yAttribute]));
                    onBrush(selectedData);
                }}
            );
            this.svgG.select(".brushG")
            .on('contextmenu', function (e, d) {
                e.preventDefault();
                const selection = self.quadtree.find(e.x - self.svgPosition.left, e.y - self.svgPosition.top, 7);
                if (!selection) return;
                const selector  = self.allDotsG.selectAll(".dotG").nodes()[selection.index];
                self.toolTipFading = false;
                Tooltip.render_tooltip(selection, selector, self.svgPosition);
            })
            .on('mousemove', function (e, d) {
                const selection = self.quadtree.find(e.x - self.svgPosition.left, e.y - self.svgPosition.top, 7);
                if (selection) {
                    if (self.focused && self.focused.index === selection.index) return;
                    if (self.focused){
                        const oldSelector = self.allDotsG.selectAll(".dotG").nodes()[self.focused.index];
                        d3.select(oldSelector).style('stroke', 'none').style('stroke-width', '0').attr('opacity', self.defaultOpacity);
                    }
                    self.focused = selection
                    const selector = self.allDotsG.selectAll(".dotG").nodes()[selection.index];
                    d3.select(selector).style('stroke', 'black').style('stroke-width', '1').attr('opacity', '1');
                } else {
                    if (self.focused) {
                        const selector = self.allDotsG.selectAll(".dotG").nodes()[self.focused.index];
                        d3.select(selector).style('stroke', 'none').style('stroke-width', '0').attr('opacity', self.defaultOpacity);
                        self.focused = undefined;
                    }
                }
                if (self.toolTipFading) return;
                self.tooltipdiv.interrupt()
                                       .transition()
                                       .duration(500)
                                       .style("opacity", 0);
                self.toolTipFading = true;

            })
            
            .call(brush);
    }

    highLightElements = utils.highLightElements(this);

    renderScatterplot = function (visData, xAttribute, yAttribute, controllerMethods) {
        if (!visData || !visData.length) return;
        
        this.updateAxis(visData, xAttribute, yAttribute);
        this.quadtree = d3.quadtree().x(d => this.xScale(d[xAttribute])).y(d => this.yScale(d[yAttribute])).addAll(visData);

        this.allDotsG.selectAll(".dotG")
            .data(visData, (itemData) => itemData.index)
            .join(
                enter => {
                    const itemG = enter.append("g")
                        .attr("class", "dotG")
                        .attr("opacity", this.defaultOpacity);

                    itemG.append("path")
                        .attr("class", "dotCircle")
                        .attr("r", this.circleRadius)
                        .attr("fill", (item) => this.seasonColorScale(item.Seasons))
                        .attr("d", d3.symbol().type((item) => this.holydaySymbolScale(item.Holiday)));
                    
                    itemG.filter((item) => item.FunctioningDay === "No")
                        .append("path")
                        .attr("class", "gear")
                        .attr("fill", (item) => this.seasonColorScale(item.Seasons))
                        .attr("transform", "translate(-9, -9) scale(0.05)")
                        .attr("d", gear_svg)
                        .attr("stroke", "black")
                        .attr("stroke-width", "1");

                    this.updateDots(itemG, xAttribute, yAttribute);
                },
                update => this.updateDots(update, xAttribute, yAttribute),
                exit => exit.remove()
            );

        this.addBrush(controllerMethods.handleOnBrush, xAttribute, yAttribute);
    }

    clear = function () {
        d3.select(this.el).selectAll("*").remove();
    }
}

export default ScatterplotD3;
