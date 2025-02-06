import {
  Emoji1,
  Emoji10,
  Emoji11,
  Emoji12,
  Emoji13,
  Emoji14,
  Emoji2,
  Emoji3,
  Emoji4,
  Emoji5,
  Emoji6,
  Emoji7,
  Emoji8,
  Emoji9,
} from "assets/emoji_svg";
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
export const EMOJIS = [
  { id: "1", component: Emoji1 },
  { id: "2", component: Emoji2 },
  { id: "3", component: Emoji3 },
  { id: "4", component: Emoji4 },
  { id: "5", component: Emoji5 },
  { id: "6", component: Emoji6 },
  { id: "7", component: Emoji7 },
  { id: "8", component: Emoji8 },
  { id: "9", component: Emoji9 },
  { id: "10", component: Emoji10 },
  { id: "11", component: Emoji11 },
  { id: "12", component: Emoji12 },
  { id: "13", component: Emoji13 },
  { id: "14", component: Emoji14 },
];
export const EMOJI_SIZE = SCREEN_WIDTH / 2;

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
