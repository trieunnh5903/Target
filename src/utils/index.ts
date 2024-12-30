import { CROP_SIZE, POST_IMAGE_SIZE } from "@/constants";

interface Props {
  translationX: number;
  originalHeight: number;
  originalWidth: number;
  translationY: number;
}

const mimeTypes = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  mp4: "video/mp4",
  pdf: "application/pdf",
};

const getMimeType = (uri: string) => {
  // Lấy phần mở rộng từ URI
  const extension = uri
    .split(".")
    .pop()
    ?.toLocaleLowerCase() as keyof typeof mimeTypes;
  if (!extension) return;
  console.log("getMimeType", extension);
  return mimeTypes[extension];
};

const generateImageCropOptions = ({
  originalHeight,
  originalWidth,
  translationX,
  translationY,
}: Props) => {
  const aspectRatio = originalWidth / originalHeight;
  const displayWidth =
    originalWidth < originalHeight
      ? POST_IMAGE_SIZE
      : aspectRatio * POST_IMAGE_SIZE;
  const displayHeight =
    originalWidth > originalHeight
      ? POST_IMAGE_SIZE
      : POST_IMAGE_SIZE / aspectRatio;

  const boundaryTranslateX = Math.abs((displayWidth - POST_IMAGE_SIZE) / 2);
  const boundaryTranslateY = Math.abs((displayHeight - POST_IMAGE_SIZE) / 2);

  const translateX = translationX * (POST_IMAGE_SIZE / CROP_SIZE);
  const translateY = translationY * (POST_IMAGE_SIZE / CROP_SIZE);

  const displayX =
    displayWidth > POST_IMAGE_SIZE ? boundaryTranslateX - translateX : 0;
  const displayY =
    displayHeight > POST_IMAGE_SIZE ? boundaryTranslateY - translateY : 0;

  const scaleFactor = originalWidth / displayWidth;
  const originX = displayX * scaleFactor;
  const originY = displayY * scaleFactor;

  const adjustedCropWidth =
    Math.min(displayWidth, POST_IMAGE_SIZE) * scaleFactor;
  const adjustedCropHeight =
    Math.min(displayHeight, POST_IMAGE_SIZE) * scaleFactor;
  return {
    height: Math.min(adjustedCropWidth, originalHeight),
    originX: originX,
    originY: originY,
    width: Math.min(adjustedCropHeight, originalWidth),
  };
};

const Utils = { getMimeType, generateImageCropOptions };

export default Utils;
