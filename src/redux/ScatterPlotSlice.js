import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedX: "Temperature",
    selectedY: "RentedBikeCount",
};

const scatterPlotSlice = createSlice({
    name: 'scatterPlot',
    initialState: initialState,
    reducers: {
        setSelectedX: (state, action) => {
            state.selectedX = action.payload;
        },
        setSelectedY: (state, action) => {
            state.selectedY = action.payload;
        },
        resetSelection: (state) => {
            state.selectedX = "Temperature";
            state.selectedY = "RentedBikeCount";
        },
    },
});

export const { setSelectedX, setSelectedY, resetSelection } = scatterPlotSlice.actions;

export default scatterPlotSlice.reducer;