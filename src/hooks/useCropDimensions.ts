import { CROP_SIZE } from "@/constants";
import { useCallback, useEffect, useMemo, useState } from "react";

interface CropDimensionConfig {
  resizeFull: boolean;
  originalWidth: number;
  originalHeight: number;
}
export const useCropDimensions = ({
  resizeFull,
  originalHeight,
  originalWidth,
}: CropDimensionConfig) => {
  // const [imageOrientation, setImgeOrientation] = useState<
  //   // 4:5 | 1.91:1 | 1:1
  //   "Portrait" | "Landscape" | "Square"
  // >();

  const imageOrientation = useMemo(
    () =>
      originalHeight === originalWidth
        ? "Square"
        : originalHeight > originalWidth
        ? "Portrait"
        : originalWidth > originalHeight
        ? "Landscape"
        : "Square",
    [originalHeight, originalWidth]
  );
  // useEffect(() => {
  //   const imageType =
  //     originalHeight === originalWidth
  //       ? "Square"
  //       : originalHeight > originalWidth
  //       ? "Portrait"
  //       : originalWidth > originalHeight
  //       ? "Landscape"
  //       : "Square";
  //   setImgeOrientation(imageType);
  // }, [originalHeight, originalWidth, resizeFull]);

  const originalRatio = originalWidth / originalHeight;

  const gridWidth = useMemo(() => {
    switch (imageOrientation) {
      case "Portrait":
        return resizeFull ? CROP_SIZE : CROP_SIZE * (4 / 5);
      case "Landscape":
        return CROP_SIZE;
      default:
        return CROP_SIZE;
    }
  }, [imageOrientation, resizeFull]);

  const gridHeight = useMemo(() => {
    switch (imageOrientation) {
      case "Portrait":
        return CROP_SIZE;
      case "Landscape":
        return resizeFull ? CROP_SIZE : CROP_SIZE / originalRatio;
      default:
        return CROP_SIZE;
    }
  }, [imageOrientation, originalRatio, resizeFull]);

  const displayWidth = useMemo(() => {
    switch (imageOrientation) {
      case "Portrait":
        return resizeFull ? CROP_SIZE : gridWidth;
      case "Landscape":
        return resizeFull ? CROP_SIZE * originalRatio : CROP_SIZE;

      default:
        return CROP_SIZE;
    }
  }, [gridWidth, imageOrientation, originalRatio, resizeFull]);

  const displayHeight = useMemo(() => {
    switch (imageOrientation) {
      case "Portrait":
        return resizeFull
          ? CROP_SIZE / originalRatio
          : gridWidth / originalRatio;
      case "Landscape":
        return resizeFull ? CROP_SIZE : CROP_SIZE / originalRatio;
      default:
        return CROP_SIZE;
    }
  }, [gridWidth, imageOrientation, originalRatio, resizeFull]);

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
    gridWidth,
    gridHeight,
    boundaryTranslateX,
    boundaryTranslateY,
  };
};
