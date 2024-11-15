import './PulsarPlot.css'
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { updateSelectedItem } from '../../redux/DataSetSlice';
import Select from 'react-select';

import PulsarD3 from './Pulsar-d3'

function PulsarContainer() {
    const data = useSelector(state => state.dataSet.data)
    const dispatch = useDispatch();

    // every time the component re-render
    useEffect(() => {
        console.log("PulsarContainer useEffect (called each time matrix re-renders)");
    }); // if no dependencies, useEffect is called at each re-render

    const divPulsarContainerRef  = useRef(null);
    const pulsarD3Ref = useRef(null)

    const getCharSize = function () {
        let width;
        let height;
        if (divPulsarContainerRef.current !== undefined) {
            width = divPulsarContainerRef.current.clientWidth
            height = divPulsarContainerRef.current.clientHeight
        }
        return { width: width, height: height };
    }

    // did mount called once the component did mount
    useEffect(() => {
        console.log("PulsarContainer useEffect for mounting");
        const pulsarD3 = new PulsarD3(divPulsarContainerRef.current);
        pulsarD3.create({ size: getCharSize() });
        pulsarD3Ref.current = pulsarD3;
        return () => {
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("PulsarContainer useEffect [] return function, called when the component did unmount...");
            const pulsarD3 = pulsarD3Ref.current;
            pulsarD3.clear()
        }
    }, []);// if empty array, useEffect is called after the component did mount (has been created)

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(() => {
        console.log("PulsarContainer useEffect with dependency [data, dispatch], called each time matrixData changes...");
        const pulsarD3 = pulsarD3Ref.current;

        const handleOnBrush = (selectedData) => dispatch(updateSelectedItem(selectedData));

        const controllerMethods = { handleOnBrush }

        pulsarD3.renderPulsar(data, controllerMethods);

    }, [data, dispatch]);// if dependencies, useEffect is called after each data update, in our case only matrixData changes.

    return (
        <div style={{ width: "100%", height: "100%", padding: "2px 10px 10px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div ref={divPulsarContainerRef} className="scatterplotDivContainer" style={{ width: "100%", height: "100%" }}> </div>
        </div>
    )
}

export default PulsarContainer;