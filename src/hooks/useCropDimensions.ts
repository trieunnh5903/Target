import { CROP_SIZE } from "@/constants";
import { useMemo } from "react";

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
  const originalRatio = originalWidth / originalHeight;
  const displayWidth = useMemo(
    () =>
      resizeFull
        ? originalWidth > originalHeight
          ? CROP_SIZE * originalRatio
          : CROP_SIZE
        : originalWidth > originalHeight
        ? CROP_SIZE
        : CROP_SIZE - 70,
    [originalHeight, originalRatio, originalWidth, resizeFull]
  );

  const displayHeight = useMemo(
    () =>
      resizeFull
        ? originalWidth > originalHeight
          ? CROP_SIZE
          : CROP_SIZE / originalRatio
        : originalWidth > originalHeight
        ? CROP_SIZE / originalRatio
        : (CROP_SIZE - 70) / originalRatio,
    [originalHeight, originalRatio, originalWidth, resizeFull]
  );

  const gridWidth = useMemo(
    () =>
      resizeFull
        ? CROP_SIZE
        : displayWidth > displayHeight
        ? CROP_SIZE
        : displayWidth,
    [displayHeight, displayWidth, resizeFull]
  );

  const gridHeight = useMemo(
    () =>
      resizeFull
        ? CROP_SIZE
        : displayWidth > displayHeight
        ? displayHeight
        : CROP_SIZE,
    [displayHeight, displayWidth, resizeFull]
  );

  const possibleTranslateY = useMemo(
    () => Math.abs(displayHeight / 2 - CROP_SIZE / 2),
    [displayHeight]
  );

  const possibleTranslateX = useMemo(
    () => Math.abs(displayWidth / 2 - CROP_SIZE / 2),
    [displayWidth]
  );

  const limitTranslateX = useMemo(
    () => Math.abs(possibleTranslateX + 100),
    [possibleTranslateX]
  );

  const limitTranslateY = useMemo(
    () => Math.abs(possibleTranslateY + 100),
    [possibleTranslateY]
  );

  // const scale = useMemo(
  //   () => originalWidth / displayWidth,
  //   [displayWidth, originalWidth]
  // );

  // const cropWidthOriginal = useMemo(
  //   () => Math.min(displayWidth, CROP_SIZE) * scale,
  //   [CROP_SIZE, displayWidth, scale]
  // );

  // const cropHeightOriginal = useMemo(
  //   () => Math.min(displayHeight, CROP_SIZE) * scale,
  //   [CROP_SIZE, displayHeight, scale]
  // );
  return {
    // cropWidthOriginal,
    // cropHeightOriginal,
    // scale,
    displayWidth,
    displayHeight,
    gridWidth,
    gridHeight,
    possibleTranslateX,
    possibleTranslateY,
    limitTranslateX,
    limitTranslateY,
  };
};
