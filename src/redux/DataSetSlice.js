import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Papa from "papaparse";

// Fetch bike-sharing data asynchronously
export const getSeoulBikeData = createAsyncThunk('seoulBikeData/fetchData', async () => {
  const response = await fetch('data/SeoulBikeData.csv');
  const responseText = await response.text();
  console.log("loaded file length:" + responseText.length);
  const responseJson = Papa.parse(responseText, { header: true, dynamicTyping: true });
  
  // Ensure we return an array of objects
  return responseJson.data.map((item, i) => ({ ...item, index: i }));
});

export const dataSetSlice = createSlice({
  name: 'dataSet',
  initialState: {
    data: [], // Initial state should be an empty array
    selectedItems: []
  },
  reducers: {
    updateSelectedItem: (state, action) => {
      state.selectedItems = action.payload; // Store selected items in state
    }
  },
  extraReducers: builder => {
    builder.addCase(getSeoulBikeData.fulfilled, (state, action) => {
      state.data = action.payload; // Store fetched data as an array
    });
  }
});

export const { updateSelectedItem } = dataSetSlice.actions;

export default dataSetSlice.reducer;