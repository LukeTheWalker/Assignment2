import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedItems: [],
    resized: false
};

const globalSlice = createSlice({
    name: 'globalSlice',
    initialState: initialState,
    reducers: {
        updateSelectedItem: (state, action) => {
            state.selectedItems = action.payload;
        },
        setResized: (state, action) => {
            state.resized = action.payload;
        },
    },
});

export const { updateSelectedItem, setResized } = globalSlice.actions;

export default globalSlice.reducer;