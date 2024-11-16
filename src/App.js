import './App.css';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import ScatterplotContainer from './components/ScatterPlot/ScatterPlotContainer'; // Import Scatterplot component
import StarCoordinateContainer from './components/StarCoordinate/StarCoordinateContainer'; // Import second visualization

function App() {
  const dispatch = useDispatch();

  // Fetch bike-sharing data when component mounts
  useEffect(() => {
    dispatch(getSeoulBikeData());
  });

return (
    <div className="App" style={{ 
        display: "flex", 
        justifyContent: "center"
    }}>
        <ScatterplotContainer /> {/* Render scatterplot */}
        <StarCoordinateContainer /> {/* Render second visualization */}
    </div>
);
}

export default App;