import { CROP_SIZE } from "@/constants";
import { SharedValue } from "react-native-reanimated";

interface Props {
  displayWidth: number;
  translationX: SharedValue<number>;
  displayHeight: number;
  originalHeight: number;
  originalWidth: number;
  translationY: SharedValue<number>;
  displayCropSize: number;
}

export const generateImageCropOptions = ({
  displayWidth,
  displayHeight,
  originalHeight,
  originalWidth,
  translationX,
  translationY,
  displayCropSize,
}: Props) => {
  const boundaryTranslateX = Math.abs(displayWidth / 2 - CROP_SIZE / 2);
  const boundaryTranslateY = Math.abs(displayHeight / 2 - CROP_SIZE / 2);
  const displayX =
    displayWidth > displayCropSize
      ? boundaryTranslateX - translationX.value
      : 0;

  const displayY =
    displayHeight > displayCropSize
      ? boundaryTranslateY - translationY.value
      : 0;

  const scale = originalWidth / displayWidth;
  const cropXOriginal = displayX * scale;
  const cropYOriginal = displayY * scale;
  const cropWidthOriginal = Math.min(displayWidth, CROP_SIZE) * scale;
  const cropHeightOriginal = Math.min(displayHeight, CROP_SIZE) * scale;

  return {
    height: Math.min(cropHeightOriginal, originalHeight),
    originX: cropXOriginal,
    originY: cropYOriginal,
    width: Math.min(cropWidthOriginal, originalWidth),
  };
};
