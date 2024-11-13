import { configureStore } from '@reduxjs/toolkit'
import dataSetReducer from './redux/DataSetSlice'
import scatterPlotReducer from './redux/ScatterPlotSlice'
export default configureStore({
  reducer: {
    dataSet: dataSetReducer,
    scatterPlot: scatterPlotReducer
    }
})