import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BottomSheetState {
  isVisible: boolean;
  type: "comment" | null;
  props: {};
}

const initialState: BottomSheetState = {
  isVisible: false,
  type: null,
  props: {},
};

const bottomSheetSlice = createSlice({
  name: "bottomSheet",
  initialState,
  reducers: {
    openSheet: (
      state,
      action: PayloadAction<Pick<BottomSheetState, "type" | "props">>
    ) => {
      state.isVisible = true;
      state.type = action.payload.type;
      state.props = action.payload.props;
    },
    closeSheet: (state) => {
      state.isVisible = false;
      state.type = null;
      state.props = {};
    },
  },
});

const { actions, reducer: bottomSheetReducer } = bottomSheetSlice;
export const { closeSheet, openSheet } = actions;
export default bottomSheetReducer;
