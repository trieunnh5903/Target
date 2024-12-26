import { CROP_SIZE, SCREEN_WIDTH } from "@/constants";
import { useMemo } from "react";

interface CropDimensionConfig {
  originalWidth: number | undefined;
  originalHeight: number | undefined;
}

export const useCropDimensions = ({
  originalHeight,
  originalWidth,
}: CropDimensionConfig) => {
  const isValid = originalHeight && originalWidth;
  const imageOrientation = useMemo(() => {
    if (isValid) {
      return originalHeight === originalWidth
        ? "Square"
        : originalHeight > originalWidth
        ? "Portrait"
        : originalWidth > originalHeight
        ? "Landscape"
        : "Square";
    }
  }, [isValid, originalHeight, originalWidth]);

  const originalRatio = (originalWidth ?? 0) / (originalHeight ?? 0);

  // const gridWidth = useMemo(() => {
  //   switch (imageOrientation) {
  //     case "Portrait":
  //       return resizeFull ? CROP_SIZE : CROP_SIZE * (4 / 5);
  //     case "Landscape":
  //       return CROP_SIZE;
  //     default:
  //       return CROP_SIZE;
  //   }
  // }, [imageOrientation, resizeFull]);

  // const gridHeight = useMemo(() => {
  //   switch (imageOrientation) {
  //     case "Portrait":
  //       return CROP_SIZE;
  //     case "Landscape":
  //       return resizeFull ? CROP_SIZE : CROP_SIZE / originalRatio;
  //     default:
  //       return CROP_SIZE;
  //   }
  // }, [imageOrientation, originalRatio, resizeFull]);

  const displayWidth = useMemo(() => {
    switch (imageOrientation) {
      case "Portrait":
        // return resizeFull ? CROP_SIZE : gridWidth;
        return CROP_SIZE;
      case "Landscape":
        // return resizeFull ? CROP_SIZE * originalRatio : CROP_SIZE;
        return CROP_SIZE * originalRatio;
      default:
        return CROP_SIZE;
    }
  }, [imageOrientation, originalRatio]);

  const displayHeight = useMemo(() => {
    switch (imageOrientation) {
      case "Portrait":
        // return resizeFull
        //   ? CROP_SIZE / originalRatio
        //   : gridWidth / originalRatio;
        return CROP_SIZE / originalRatio;
      case "Landscape":
        // return resizeFull ? CROP_SIZE : CROP_SIZE / originalRatio;
        return CROP_SIZE;
      default:
        return CROP_SIZE;
    }
  }, [imageOrientation, originalRatio]);

  const boundaryTranslateY = useMemo(
    () => Math.abs(displayHeight / 2 - CROP_SIZE / 2),
    [displayHeight]
  );

  const boundaryTranslateX = useMemo(
    () => Math.abs(displayWidth / 2 - CROP_SIZE / 2),
    [displayWidth]
  );

  return {
    displayWidth,
    displayHeight,
    gridWidth: SCREEN_WIDTH,
    gridHeight: SCREEN_WIDTH,
    boundaryTranslateX,
    boundaryTranslateY,
  };
};
