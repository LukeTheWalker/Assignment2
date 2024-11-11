import './App.css';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import ScatterplotContainer from './components/ScatterplotContainer'; // Import Scatterplot component
import SecondVisualizationContainer from './components/SecondVisualizationContainer'; // Import second visualization

function App() {
  const dispatch = useDispatch();

  // Fetch bike-sharing data when component mounts
  useEffect(() => {
    dispatch(getSeoulBikeData());
  }, [dispatch]);

  return (
    <div className="App">
        <div id="view-container" className="row">
          <ScatterplotContainer /> {/* Render scatterplot */}
          <SecondVisualizationContainer /> {/* Render second visualization */}
        </div>
    </div>
  );
}

export default App;