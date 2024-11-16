import * as d3 from 'd3'
import utils from '../common'

class StarCoordinateD3 {
    margin = { top: 0, right: 0, bottom: 0, left: 0 };
    size;
    height;
    width;
    svg;
    circleRadius = 2;
    defaultOpacity = .3;

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
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class","svgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.allDotsG = this.svg.append("g")
            .attr("class", "allDotsG");

        this.axesG = this.svg.append("g")
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
                .attr("class", "axisLine")
                .attr("id", "axisLine" + axis);

            axeG.append("line") 
                .style("stroke", "black")
            // Axis label text
            axeG.append("text")
                .attr("class", "axisLabel")
                .attr("id", "axisLabel" + axis)
                .text(axis)
        });
    }

    addDragging = function(visData){
        this.valid_options.forEach(axis => {
            d3.select("#axisLabel" + axis)
                .call(d3.drag()
                    .on("drag", (event) => {
                        const x = event.x;
                        const y = event.y;
                        const index = this.valid_options.indexOf(axis);
                        this.axis_tips[index] = { x, y };
                        this.updateAxis(visData);
                        this.updateDots(this.allDotsG.selectAll(".dotG"));
                    }
                ));
        });
    }

    updateDots(selection, transitionDuration = 0) { 
        selection
            .transition()
            .duration(transitionDuration)
            .attr("transform", d => {
                const point = this.getPoint(d);
                return `translate(${point.x}, ${point.y})`;
            });
    }

    getPoint = d => {
        const startPoint = { x: this.anchorPoint.x, y: this.anchorPoint.y };
        const mapped = this.axes.map(axis => {
            const value = axis.accessor(d);
            const x = axis.xScale(value) - this.anchorPoint.x;
            const y = axis.yScale(value) - this.anchorPoint.y;
            return {x, y};
        });

        const sum = mapped.reduce((pointA, pointB) => {
            return {
                x: pointA.x + pointB.x,
                y: pointA.y + pointB.y
            };
        }, startPoint);

        return sum;
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
            this.axesG.select("#axisLine" + key)
                .select("line")
                .style("stroke", "black")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2);

            // Axis label text
            this.axesG.select("#axisLabel" + key)
                .attr("x", x2)
                .attr("y", y2)
                .attr("fill", "black")
                .attr("text-anchor", "middle")
        });
    }


    renderStarCoordinate = function (visData, controllerMethods){
        if (!visData || !visData.length) return;
        this.updateAxis(visData);
        this.addDragging(visData);

        this.allDotsG.selectAll(".dotG")
            .data(visData, (itemData) => itemData.index)
            .join(
                enter=>{
                    // all data items to add:
                    // doesn’exist in the select but exist in the new array
                    const dotG=enter.append("g")
                        .attr("class","dotG")
                        .attr("transform", `translate(${this.anchorPoint.x}, ${this.anchorPoint.y})`)
                        .attr("opacity", this.defaultOpacity);



                    // render element as child of each element "g"
                    // dotG.append("g")
                    //     .attr("class", "dotCircle")
                    //     .append("path")
                    //     .style("opacity", 0.3)
                    //     .attr("r", 3)

                    dotG.append("path")
                        .attr("class", "dotCircle")
                        .attr("r", this.circleRadius)
                        .attr("fill", (item) => this.seasonColorScale(item.Seasons))
                        .attr("d", d3.symbol().type((item) => this.holydaySymbolScale(item.Holiday)))
                    

                    this.updateDots(dotG, 5000);
                },
                update => {},
                exit   => exit.remove()
            )
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default StarCoordinateD3;