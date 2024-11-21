import * as d3 from 'd3'
import utils from '../common'
import Tooltip from '../Tooltip/Tooltip';
import { filterInRectFromQuadtree } from 'vis-utils';
import gear_svg from '../../img/gear';

class StarCoordinateD3 {
    margin = { top: 0, right: 0, bottom: 0, left: 0 };
    size;
    height;
    width;
    svg;
    circleRadius = 2;
    defaultOpacity = .3;

    focused;
    toolTipFading = false;

    label_offset = 10;

    valid_options = ["RentedBikeCount", "Hour", "Temperature", "Snowfall", "Visibility", "WindSpeed", "Rainfall", "DewPointTemperature", "Humidity", "SolarRadiation"]
    constructor(el){
        this.el=el;
    };

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.anchorPoint = {
            x: this.width  / 2,
            y: this.height / 2 
        };

        this.seasonColorScale = utils.seasonColorScale
        this.holydaySymbolScale = utils.holydaySymbolScale

        // initialize the svg and keep it in a class property to reuse it in renderMatrix()
        this.svg=d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.legendSvg = d3.select(this.el).append("svg")
            .attr("width", "100%")
            .attr("height", 50);

        this.svgG = this.svg.append("g")
            .attr("class","svgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.svgPosition = {
            left: this.margin.left + this.svg.node().getBoundingClientRect().left,
            top : this.margin.top  + this.svg.node().getBoundingClientRect().top,
        } 

        this.legend = this.legendSvg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(25, 25)");
        
        this.allDotsG = this.svgG.append("g")
            .attr("class", "allDotsG");

        this.svgG.append("g")
            .attr("class", "brushG");

        this.axesG = this.svgG.append("g")
            .attr("class","axesG");      

        this.axis_tips = this.valid_options.map(option => {
            const angle = (2 * Math.PI / this.valid_options.length) * this.valid_options.indexOf(option);
            return {
                x: this.anchorPoint.x + this.width / 3 * Math.cos(angle),
                y: this.anchorPoint.y + this.height / 3 * Math.sin(angle)
            };
        });

        this.valid_options.forEach(axis => {
            // Axis line
            const axeG  = this.axesG.append("g")
                .attr("class", "axisGroup")
                .attr("id", "axisGroup" + axis);

            axeG.append("g")
                .attr("class", "axisLine")
                .attr("id", "axisLine" + axis);

           
            // Axis label text
            const axisLabel = axeG.append("text")
                .attr("class", "axisLabel")
                .attr("id", "axisLabel" + axis)
                .attr("transform", `translate(${-10000}, ${-10000})`)
                .text(axis);

            const bbox = axisLabel.node().getBBox();

            axeG.append("rect")
                .attr("class", "axisLabelBackground")
                .attr("id", "axisLabelBackground" + axis)
                .attr("x", bbox.x - bbox.width / 2 - 5)
                .attr("y", bbox.y - 2)
                .attr("width", bbox.width + 10)
                .attr("height", bbox.height + 4)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("transform", `translate(${-10000}, ${-10000})`)
                .attr("opacity", 0.5)

            axisLabel.raise();

        });

        this.tooltipdiv = d3.select("body").select(".tooltip-div");

        this.createLegend();
    }

    addDragging = function(visData){
        this.valid_options.forEach(axis => {
            d3.select("#axisLabel" + axis)
                .call(d3.drag()
                    .on("drag", (event) => {
                        let x = event.x;
                        let y = event.y;
                        const angle = Math.atan2(y - this.anchorPoint.y, x - this.anchorPoint.x);
                        const angleDegrees = (angle * 180 / Math.PI + 360) % 360;
                        const y_offset = angleDegrees > 60 && angleDegrees < 150 ? -2*this.label_offset : +this.label_offset;
                        y = y + y_offset;
                        const index = this.valid_options.indexOf(axis);
                        this.axis_tips[index] = { x, y };
                        this.updateAxis(visData);
                        this.updateDots(this.allDotsG.selectAll(".dotG"));
                    })
                    .on("end", () => this.quadtree = d3.quadtree().x(d => this.getX(d)).y(d => this.getY(d)).addAll(visData))
                );
        });
    }

    updateDots = function(selection, transitionDuration = 0) { 
        selection
            .transition()
            .duration(transitionDuration)
            .attr("transform", d => {
                const point = this.getPoint(d);
                return `translate(${point.x}, ${point.y})`;
            });
    }
    getX = function (d) {
        const startPointX = this.anchorPoint.x;
        const mappedX = this.axes.map(axis => {
            const value = axis.accessor(d);
            return axis.xScale(value) - this.anchorPoint.x;
        });

        const sumX = mappedX.reduce((xA, xB) => xA + xB, startPointX);
        return sumX;
    };

    getY = function (d) {
        const startPointY = this.anchorPoint.y;
        const mappedY = this.axes.map(axis => {
            const value = axis.accessor(d);
            return axis.yScale(value) - this.anchorPoint.y;
        });

        const sumY = mappedY.reduce((yA, yB) => yA + yB, startPointY);
        return sumY;
    };
    getPoint = function (d) {
        return { x: this.getX(d), y: this.getY(d) };
    };

    updateAxis = function (visData) {
        this.axesData = this.valid_options.reduce((acc, option) => {
            acc[option] = {
                domain: d3.extent(visData, d => d[option]),
                accessor: d => d[option],
                tip_end_x: this.axis_tips[this.valid_options.indexOf(option)].x,
                tip_end_y: this.axis_tips[this.valid_options.indexOf(option)].y
            };
            return acc;
        }, {});

        this.axesDataArray = Object.keys(this.axesData).map(key => {
            const value = this.axesData[key];
            value.key = key;
            return value;
        });

        this.axes = this.axesDataArray.map(ax => {
            const { domain, tip_end_x, tip_end_y } = ax;
            ax.xScale = d3
              .scaleLinear()
              .domain(domain)
              .range([this.anchorPoint.x, tip_end_x]);
            ax.yScale = d3
              .scaleLinear()
              .domain(domain)
              .range([this.anchorPoint.y, tip_end_y]);
            return ax;
          });

        // Axis Lines
        this.axes.forEach(axis => {
            const { domain, key } = axis;
            const x1 = axis.xScale(domain[0]);
            const y1 = axis.yScale(domain[0]);
            const x2 = axis.xScale(domain[1]);
            const y2 = axis.yScale(domain[1]);
            // Axis line
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            const axisLength = Math.hypot(x2 - x1, y2 - y1);


            const angleDegrees = (angle + 360) % 360;
            const special_angle = (angleDegrees >= 140 && angleDegrees <= 320);
            const scaling = special_angle ? -1 : 1;
            this.axesG.select("#axisLine" + key)
                .attr("transform", `translate(${this.anchorPoint.x}, ${this.anchorPoint.y}) rotate(${angleDegrees})`)
                .call(d3.axisBottom(d3.scaleLinear().domain(domain).range([0, axisLength])))
                .selectAll(".tick > text, .tick > line")
                .attr("transform", `scale(${scaling}, ${scaling})`);
            
            const x_offset = 0;
            const y_offset = angleDegrees > 60 && angleDegrees < 150 ? +2*this.label_offset : -this.label_offset;

            this.axesG.select("#axisLabelBackground" + key)
                .attr("transform", `translate(${x2 + x_offset}, ${y2 + y_offset})`)

            this.axesG.select("#axisLabel" + key)
                .attr("transform", `translate(${x2 + x_offset}, ${y2 + y_offset})`)
                .attr("fill", "black")
                .attr("text-anchor", "middle")

        });
    }

    createLegend = utils.createLegend(this);

    addBrush = function (onBrush) {
        const self = this;
        const brush = d3.brush()
            .extent([[0, 0], [this.width, this.height]])
            .filter((e) => !e.ctrlKey && !e.button)
            .on("start brush end", (event) => {
                if (event.type === "start")
                    d3.selectAll(".brushG").selectAll(".selection").style("display", "none");

                if (event.selection) {
                    const selectedData = filterInRectFromQuadtree(this.quadtree, event.selection, d => this.getX(d), d => this.getY(d));
                    onBrush(selectedData);
                }
            });
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

    renderStarCoordinate = function (visData, controllerMethods){
        if (!visData || !visData.length) return;

        this.updateAxis(visData);
        this.addDragging(visData);
        this.quadtree = d3.quadtree().x(d => this.getX(d)).y(d => this.getY(d)).addAll(visData);


        this.allDotsG.selectAll(".dotG")
            .data(visData, (itemData) => itemData.index)
            .join(
                enter=>{
                    const dotG=enter.append("g")
                        .attr("class","dotG")
                        .attr("transform", `translate(${this.anchorPoint.x}, ${this.anchorPoint.y})`)
                        .attr("opacity", this.defaultOpacity);

                    dotG.append("path")
                        .attr("class", "dotCircle")
                        .attr("r", this.circleRadius)
                        .attr("fill", (item) => this.seasonColorScale(item.Seasons))
                        .attr("d", d3.symbol().type((item) => this.holydaySymbolScale(item.Holiday)));
                    
                    dotG.filter((item) => item.FunctioningDay === "No")        
                        .append("path")
                        .attr("class", "gear")
                        .attr("fill", (item) => this.seasonColorScale(item.Seasons))
                        .attr("transform", "translate(-9.2, -9.2) scale(0.05)")
                        .attr("d", gear_svg)
                        .attr("stroke", "black")
                        .attr("stroke-width", "1");

                    

                    this.updateDots(dotG, 5000);
                },
                update => {},
                exit   => exit.remove()
            )
        this.addBrush(controllerMethods.handleOnBrush);
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default StarCoordinateD3;