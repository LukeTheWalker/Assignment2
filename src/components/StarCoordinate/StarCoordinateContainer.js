import './StarCoordinate.css'
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { updateSelectedItem } from '../../redux/DataSetSlice';

import StarCoordinateD3 from './StarCoordinate-d3'

function StarCoordinateContainer() {
    const data = useSelector(state => state.dataSet.data)
    const selectedItems = useSelector(state => state.dataSet.selectedItems);
    const dispatch = useDispatch();

    // every time the component re-render
    useEffect(() => {
        console.log("StarCoordinateContainer useEffect (called each time matrix re-renders)");
    }); // if no dependencies, useEffect is called at each re-render

    const divStarCoordinateContainerRef  = useRef(null);
    const starCoordinateD3Ref = useRef(null)

    const getCharSize = function () {
        let width;
        let height;
        if (divStarCoordinateContainerRef.current !== undefined) {
            width = divStarCoordinateContainerRef.current.clientWidth
            height = divStarCoordinateContainerRef.current.clientHeight
        }
        if (width > height) {
            width = height;
        } else {
            height = width;
        }
        return { width: width, height: height };
    }

    // did mount called once the component did mount
    useEffect(() => {
        console.log("StarCoordinateContainer useEffect for mounting");
        const starCoordinateD3 = new StarCoordinateD3(divStarCoordinateContainerRef.current);
        starCoordinateD3.create({ size: getCharSize() });
        starCoordinateD3Ref.current = starCoordinateD3;
        return () => {
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("StarCoordinateContainer useEffect [] return function, called when the component did unmount...");
            const starCoordinateD3 = starCoordinateD3Ref.current;
            starCoordinateD3.clear()
        }
    }, []);// if empty array, useEffect is called after the component did mount (has been created)

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(() => {
        console.log("StarCoordinateContainer useEffect with dependency [data, dispatch], called each time matrixData changes...");
        const starCoordinateD3 = starCoordinateD3Ref.current;

        const handleOnBrush = (selectedData) => dispatch(updateSelectedItem(selectedData));

        const controllerMethods = { handleOnBrush }

        starCoordinateD3.renderStarCoordinate(data, controllerMethods);

    }, [data, dispatch]);// if dependencies, useEffect is called after each data update, in our case only matrixData changes.

    useEffect(() => {
        const starCoordinateD3 = starCoordinateD3Ref.current;
        starCoordinateD3.highLightElements(selectedItems);
    }, [selectedItems]);

    return (
        <div style={{ width: "100%", height: "100%", padding: "2px 10px 10px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div ref={divStarCoordinateContainerRef} className="starCoordinateDivContainer" style={{ width: "100%", height: "100%" }}> </div>
        </div>
    )
}

export default StarCoordinateContainer;