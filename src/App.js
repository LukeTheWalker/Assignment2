import './App.css';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import { setResized } from './redux/GlobalSlice';
import ScatterplotContainer from './components/ScatterPlot/ScatterPlotContainer';
import StarCoordinateContainer from './components/StarCoordinate/StarCoordinateContainer';

function App() {
    const dispatch = useDispatch();
    const resizedRef = useRef(useSelector(state => state.global.resized)); // Use a ref to persist the value

    useEffect(() => {
        dispatch(getSeoulBikeData());

        const handleResize = () => {
            clearTimeout(window.resizeend);
            window.resizeend = setTimeout(() => {
                resizedRef.current = !resizedRef.current;
                dispatch(setResized(resizedRef.current));
            }, 500);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [dispatch]); // Include dispatch in the dependency array

    return (
        <div className="App">
            <ScatterplotContainer />
            <StarCoordinateContainer />
        </div>
    );
}

export default App;
