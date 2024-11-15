import './App.css';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import ScatterplotContainer from './components/ScatterPlot/ScatterplotContainer'; // Import Scatterplot component
import SecondVisualizationContainer from './components/SecondVis/PulsarContainer'; // Import second visualization

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
        <SecondVisualizationContainer /> {/* Render second visualization */}
    </div>
);
}

export default App;