import { CROP_SIZE } from "@/constants";
import { SharedValue } from "react-native-reanimated";

interface Props {
  displayWidth: number;
  boundaryTranslateX: number;
  translationX: SharedValue<number>;
  displayHeight: number;
  boundaryTranslateY: number;
  originalHeight: number;
  originalWidth: number;
  translationY: SharedValue<number>;
}

export const generateImageCropOptions = ({
  displayWidth,
  boundaryTranslateX,
  translationX,
  displayHeight,
  boundaryTranslateY,
  originalHeight,
  originalWidth,
  translationY,
}: Props) => {
  const cropXDisplay =
    displayWidth > CROP_SIZE ? boundaryTranslateX - translationX.value : 0;

  const cropYDisplay =
    displayHeight > CROP_SIZE ? boundaryTranslateY - translationY.value : 0;

  const scale = originalWidth / displayWidth;
  const cropXOriginal = cropXDisplay * scale;
  const cropYOriginal = cropYDisplay * scale;
  const cropWidthOriginal = Math.min(displayWidth, CROP_SIZE) * scale;
  const cropHeightOriginal = Math.min(displayHeight, CROP_SIZE) * scale;

  return {
    height: Math.min(cropHeightOriginal, originalHeight),
    originX: cropXOriginal,
    originY: cropYOriginal,
    width: Math.min(cropWidthOriginal, originalWidth),
  };
};
