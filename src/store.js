import { configureStore } from '@reduxjs/toolkit'
import dataSetReducer from './redux/DataSetSlice'
import scatterPlotReducer from './redux/ScatterPlotSlice'
import globalReducer from './redux/GlobalSlice'
export default configureStore({
  reducer: {
    dataSet: dataSetReducer,
    scatterPlot: scatterPlotReducer,
    global: globalReducer
    }
})