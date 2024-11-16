import './Tooltip.css';
import { useEffect, useRef, Component } from 'react';
import {useSelector, useDispatch} from 'react-redux'
import * as d3 from 'd3';

// TODO: import action methods from reducers

class Tooltip extends Component {

    static tooltip_text = (d) => `
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
        
    static render_tooltip(d, selector, position) {

        const circ = d3.select(selector)
        
        const translate = circ.attr("transform").match(/translate\(([^)]+)\)/)[1].split(",");
        const x = parseFloat(translate[0]);
        const y = parseFloat(translate[1]);

        const tooltipdiv = d3.select(".tooltip-div");
        tooltipdiv.html(Tooltip.tooltip_text(d));

        const tooltipWidth = tooltipdiv.node().getBoundingClientRect().width;
        const tooltipHeight = tooltipdiv.node().getBoundingClientRect().height;

        let flipping_offset = 0;


        if (position.top + y - tooltipHeight - 5 < 0) {
            d3.select(".tooltip-div-after").style("border-bottom-color", "#333");
            d3.select(".tooltip-div-before").style("border-top-color", "transparent");

            flipping_offset = tooltipHeight + 10;
        }
        else {
            d3.select(".tooltip-div-after").style("border-bottom-color", "transparent");
            d3.select(".tooltip-div-before").style("border-top-color", "#333");

            flipping_offset = - 10;
        }

        tooltipdiv
            .interrupt()
            .style("left", (position.left - (tooltipWidth / 2) + x) + "px")
            .style("top",  (position.top  - tooltipHeight + flipping_offset + y) + "px")
            .transition()
            .duration(300)
            .style("opacity", 1)
    }

    render() {
        return <div className="tooltip-div" style={{opacity:0}}> </div>
    }
}

export default Tooltip;