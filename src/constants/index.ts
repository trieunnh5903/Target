import { Dimensions, StatusBar, StyleSheet } from "react-native";

export const SPACING = {
  small: 8,
  medium: 16,
  large: 24,
  extraLarge: 32,
};

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

export const STATUS_BAR_HEIGHT = StatusBar.currentHeight ?? 0;

export const CROP_SIZE = SCREEN_WIDTH;
export const POST_IMAGE_SIZE = SCREEN_WIDTH * 0.6;

export const GLOBAL_STYLE = StyleSheet.create({
  flex_1: {
    flex: 1,
  },
  fullSize: {
    height: "100%",
    width: "100%",
    backgroundColor: "#f0f0f0",
  },
  fullWidth: {
    width: "100%",
  },
  fullHeight: {
    height: "100%",
  },
  /* Column Layouts */
  column: {
    flexDirection: "column",
  },
  columnReverse: {
    flexDirection: "column-reverse",
  },
  colCenter: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  colVCenter: {
    flexDirection: "column",
    alignItems: "center",
  },
  colHCenter: {
    flexDirection: "column",
    justifyContent: "center",
  },
  /* Row Layouts */
  row: {
    flexDirection: "row",
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rowVCenter: {
    flexDirection: "row",
    justifyContent: "center",
  },
  rowHCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  /* Default Layouts */
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  alignItemsCenter: {
    alignItems: "center",
  },
  alignItemsStart: {
    alignItems: "flex-start",
  },
  alignItemsEnd: {
    alignItems: "flex-end",
  },
  alignItemsStretch: {
    alignItems: "stretch",
  },
  justifyContentCenter: {
    justifyContent: "center",
  },
  justifyContentAround: {
    justifyContent: "space-around",
  },
  justifyContentBetween: {
    justifyContent: "space-between",
  },
  justifyContentEnd: {
    justifyContent: "flex-end",
  },
  scrollSpaceAround: {
    flexGrow: 1,
    justifyContent: "space-around",
  },
  scrollSpaceBetween: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  selfStretch: {
    alignSelf: "stretch",
  },
  selfEnd: {
    alignSelf: "flex-end",
  },
});
