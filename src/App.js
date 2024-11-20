import './App.css';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import { setResized } from './redux/GlobalSlice';
import ScatterplotContainer from './components/ScatterPlot/ScatterPlotContainer'; // Import Scatterplot component
import StarCoordinateContainer from './components/StarCoordinate/StarCoordinateContainer'; // Import second visualization

function App() {
    const dispatch = useDispatch();
    let   resized = useSelector(state => state.global.resized);
    // Fetch bike-sharing data when component mounts
    useEffect(() => {
        dispatch(getSeoulBikeData());
        window.addEventListener("resize", () => {
            clearTimeout(window.resizeend);
            window.resizeend = setTimeout(() => {
                resized = !resized;
                dispatch(setResized(resized));
            }, 500);
        })
        return () => window.removeEventListener("resize", () => {});
    }, []);

    return (
        <div className="App">
            <ScatterplotContainer /> {/* Render scatterplot */}
            <StarCoordinateContainer /> {/* Render second visualization */}
        </div>
    );
}

export default App;