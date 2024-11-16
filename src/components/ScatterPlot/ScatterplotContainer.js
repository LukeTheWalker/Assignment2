import './ScatterPlot.css'
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { updateSelectedItem } from '../../redux/DataSetSlice';
import { setSelectedX, setSelectedY } from '../../redux/ScatterPlotSlice';
import Select from 'react-select';

import ScatterplotD3 from './Scatterplot-d3'

function ScatterplotContainer() {
    const data = useSelector(state => state.dataSet.data)
    const dispatch = useDispatch();

    const valid_options = ["Date", "RentedBikeCount", "Hour", "Temperature", "Humidity", "WindSpeed", "Visibility", "DewPointTemperature", "SolarRadiation", "Rainfall", "Snowfall"]
    const options = valid_options.map((option) => {
        return { value: option, label: option };
    });

    const xAttribute = useSelector(state => state.scatterPlot.selectedX);
    const yAttribute = useSelector(state => state.scatterPlot.selectedY);
    const selectedItems = useSelector(state => state.dataSet.selectedItems);

    // every time the component re-render
    useEffect(() => {
        console.log("ScatterplotContainer useEffect (called each time matrix re-renders)");
    }); // if no dependencies, useEffect is called at each re-render

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null)

    const getCharSize = function () {
        let width;
        let height;
        if (divContainerRef.current !== undefined) {
            width = divContainerRef.current.clientWidth
            height = divContainerRef.current.clientHeight
        }
        return { width: width, height: height };
    }

    // did mount called once the component did mount
    useEffect(() => {
        console.log("ScatterplotContainer useEffect for mounting");
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({ size: getCharSize() });
        scatterplotD3Ref.current = scatterplotD3;
        return () => {
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("ScatterplotContainer useEffect [] return function, called when the component did unmount...");
            const scatterplotD3 = scatterplotD3Ref.current;
            scatterplotD3.clear()
        }
    }, []);// if empty array, useEffect is called after the component did mount (has been created)

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(() => {
        console.log("ScatterplotContainer useEffect with dependency [matrixData,dispatch], called each time matrixData changes...");
        const scatterplotD3 = scatterplotD3Ref.current;

        const handleOnMouseEnter = function (cellData) {
            // dispatch(updateHoveredCell(cellData))
        }
        const handleOnMouseLeave = function () {
            // dispatch(updateHoveredCell({}))
        }

        const handleOnBrush = (selectedData) => dispatch(updateSelectedItem(selectedData));

        const controllerMethods = {
            handleOnMouseEnter,
            handleOnMouseLeave,
            handleOnBrush
        }

        scatterplotD3.renderScatterplot(data, xAttribute, yAttribute, controllerMethods);
    }, [data, xAttribute, yAttribute, dispatch]);// if dependencies, useEffect is called after each data update, in our case only matrixData changes.

    useEffect(() => {
        const scatterplotD3 = scatterplotD3Ref.current;
        scatterplotD3.highLightElements(selectedItems);
    }, [selectedItems]);

    return (
        <div style={{ width: "100%", height: "100%", padding: "2px 10px 10px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", width: "100%" }}>
                <Select options={options} value={options.find(option => option.value === xAttribute)} styles={{ container: base => ({ ...base, minWidth: 200 }) }} onChange={(selectedOption) => dispatch(setSelectedX(selectedOption.value))} />
                <Select options={options} value={options.find(option => option.value === yAttribute)} styles={{ container: base => ({ ...base, minWidth: 200 }) }} onChange={(selectedOption) => dispatch(setSelectedY(selectedOption.value))} />
            </div>
            <div ref={divContainerRef} className="scatterplotDivContainer" style={{ width: "100%", height: "100%" }}> </div>
        </div>
    )
}

export default ScatterplotContainer;