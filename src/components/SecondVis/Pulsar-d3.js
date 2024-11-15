import * as d3 from 'd3'
import { getDefaultFontSize } from '../../utils/helper';

class PulsarD3 {
    margin = { top: 0, right: 0, bottom: 0, left: 0 };
    size;
    height;
    width;
    svg;

    valid_options = ["RentedBikeCount", "Hour", "Temperature", "Humidity", "WindSpeed", "Visibility", "DewPointTemperature", "SolarRadiation", "Rainfall", "Snowfall"]
    // valid_options = ["RentedBikeCount", "Temperature", "Humidity"]


    // add specific class properties used for the vis render/updates
    // cellSize= 34;
    // radius = this.cellSize / 2;
    // colorScheme = d3.schemeYlGnBu[9];
    // cellColorScale = d3.scaleQuantile(this.colorScheme);
    // cellSizeScale = d3.scaleLinear()
    //     .range([2, this.radius-1])
    // ;


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

        // initialize the svg and keep it in a class property to reuse it in renderMatrix()
        this.svg=d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class","svgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.axesG = this.svg.append("g")
            .attr("class","axesG");
        
        this.allDotsG = this.svg.append("g")
            .attr("class", "allDotsG");
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

    updateFunction1(selection){
        // transform selection
        // selection.attr("transform", (itemData)=>{
        //      // use scales to return shape position from data values
        // })

        // change sub-element
        // selection.select(".classname")
        //    .attr("fill",(itemData)=>{
        //          // use scale to return visual attribute from data values
        //    })
    }

    updateAxis = function (visData) {
        this.axesData = this.valid_options.reduce((acc, option) => {
            const angle = (2 * Math.PI / this.valid_options.length) * this.valid_options.indexOf(option);
            acc[option] = {
                domain: d3.extent(visData, d => d[option]),
                accessor: d => d[option],
                tip_end_x: this.anchorPoint.x + this.width / 2 * Math.cos(angle),
                tip_end_y: this.anchorPoint.y + this.height / 2 * Math.sin(angle)
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
            this.axesG.append("g")
                .classed("axis-line", true)
                .append("line")
                .style("stroke", "black")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2);
            // Axis label text
            this.axesG.append("g")
                .classed("axis-label", true)
                .attr("transform", `translate(${x2}, ${y2})`)
                .append("text")
                .text(key);
        });
    }


    renderPulsar = function (visData, controllerMethods){
        if (!visData || !visData.length) return;
        this.updateAxis(visData);

        this.allDotsG.selectAll(".dotG")
            .data(visData,(itemData)=>itemData.index)
            .join(
                enter=>{
                    // all data items to add:
                    // doesn’exist in the select but exist in the new array
                    const itemG=enter.append("g")
                        .attr("class","itemG");
                    // render element as child of each element "g"

                    itemG.append("g")
                    .attr("class", "dotCircle")
                    .attr("transform", d => { 
                        const point = this.getPoint(d);
                        return `translate(${point.x}, ${point.y})`;
                    })
                    .append("circle")
                    .style("opacity", 0.3)
                    .attr("r", 3);
                },
                update=>{this.updateFunction1(update)},
                exit =>{
                    exit.remove()
                    ;
                }

            )
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default PulsarD3;