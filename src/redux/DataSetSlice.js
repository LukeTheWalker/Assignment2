import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Papa from "papaparse";



// Fetch bike-sharing data asynchronously
export const getSeoulBikeData = createAsyncThunk('seoulBikeData/fetchData', async () => {
    const response = await fetch('data/SeoulBikeData.csv');
    const responseText = await response.text();
    console.log("loaded file length:" + responseText.length);
    const responseJson = Papa.parse(responseText, { header: true, dynamicTyping: true });

    const string_to_iso = (date_str) => {
        const [day, month, year] = date_str.split('/').map(Number);
        return new Date(year, month - 1, day).getTime();
    }

    // Ensure we return an array of objects with Date column converted to Date object
    return responseJson.data.map((item, i) => ({
        ...item,
        Date: string_to_iso(item.Date),
        index: i
    }));
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