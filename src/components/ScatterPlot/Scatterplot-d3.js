import * as d3 from 'd3';

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

    tooltip_text = (d) => `
        <div class="tooltip-div-before"></div>
        <strong>🌸 Date:</strong> ${new Date(d.Date).toLocaleDateString("it-IT")} <br>
        <strong>🚴‍♂️ Bikes Rented:</strong> ${d.RentedBikeCount} bikes!<br>
        <strong>🕒 Time:</strong> ${d.Hour}:00<br>
        <strong>🌡️ Temp:</strong> ${d.Temperature}°C<br>
        <strong>💧 Humidity:</strong> ${d.Humidity}%<br>
        <strong>🍃 Wind Speed:</strong> ${d.WindSpeed} m/s<br>
        <strong>👁️ Visibility:</strong> ${d.Visibility} m<br>
        <strong>❄️ Dew Point:</strong> ${d.DewPointTemperature}°C<br>
        <strong>☀️ Solar Radiation:</strong> ${d.SolarRadiation} MJ/m²<br>
        <strong>🌧️ Rainfall:</strong> ${d.Rainfall} mm<br>
        <strong>❄️ Snowfall:</strong> ${d.Snowfall} cm<br>
        <strong>🍂 Season:</strong> ${d.Seasons}<br>
        <strong>🎉 Holiday? </strong>${d.Holiday === "Yes" ? "Yay! 🎊" : "Nope 😔"}<br>
        <strong>⚙️ Functioning Day?</strong> ${d.FunctioningDay === "Yes" ? "Yep! 😊" : "Nope 😢"}
        <div class="tooltip-div-after"></div>`;

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

        this.seasonColorScale = d3.scaleOrdinal()
            .domain(["Spring", "Summer", "Autumn", "Winter"])
            .range(["green", "red", "orange", "blue"]);

        this.holydaySymbolScale = d3.scaleOrdinal()
            .domain(["No Holiday", "Holiday"])
            .range([d3.symbolCircle, d3.symbolStar]);

        this.tooltipdiv = d3.select("body").append("div")
            .attr("class", "tooltip-div")
            .style("opacity", 0)
            .style("position", "absolute");
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
                        x0 <= this.xScale(d.Temperature) && this.xScale(d.Temperature) <= x1 &&
                        y0 <= this.yScale(d.RentedBikeCount) && this.yScale(d.RentedBikeCount) <= y1
                    );
                    onBrush(selectedData);
                }}
            );
        this.svg.select(".brushG")
            .call(brush);
    }

    render_tooltip(d, selector) {
        const circ = d3.select(selector)

        const translate = circ.attr("transform").match(/translate\(([^)]+)\)/)[1].split(",");
        const x = parseFloat(translate[0]);
        const y = parseFloat(translate[1]);

        const tooltipdiv = d3.select(".tooltip-div");
        tooltipdiv.html(this.tooltip_text(d));

        const tooltipWidth = tooltipdiv.node().getBoundingClientRect().width;
        const tooltipHeight = tooltipdiv.node().getBoundingClientRect().height;

        const svgPosition = this.svg.node().getBoundingClientRect();

        let flipping_offset = 0;

        if (svgPosition.top + y - tooltipHeight - 5 < 0) {
            d3.select(".tooltip-div-after").style("border-bottom-color", "#333");
            d3.select(".tooltip-div-before").style("border-top-color", "");

            flipping_offset = tooltipHeight + 5;
        }
        else {
            d3.select(".tooltip-div-after").style("border-bottom-color", "transparent");
            d3.select(".tooltip-div-before").style("border-top-color", "#333");

            flipping_offset = - 15;
        }

        tooltipdiv
            .interrupt()
            .style("left", (this.margin.left + svgPosition.left + x - (tooltipWidth / 2) - 10.5) + "px")
            .style("top", (this.margin.top + svgPosition.top + y - tooltipHeight + flipping_offset) + "px")
            .transition()
            .duration(300)
            .style("opacity", 1)
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
                            self.render_tooltip(d, this);
                        })
                        .on('mouseout', function (e, d) {
                            d3.select(this).attr("opacity", self.defaultOpacity).style('stroke', 'none').style('stroke-width', '0');
                            d3.select(".tooltip-div")
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