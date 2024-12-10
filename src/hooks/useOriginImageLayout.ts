import { View, Text } from "react-native";
import React, { RefObject, useState } from "react";

interface Params {
  imageRef: RefObject<View | null>;
}

export function useOriginImageLayout({ imageRef }: Params) {
  const [originImageLayout, setOriginImageLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const updateOriginImageLayout = () => {
    imageRef.current?.measureInWindow((x, y, width, height) => {
      setOriginImageLayout({
        width,
        height,
        x,
        y,
      });
    });
  };
  return { originImageLayout, updateOriginImageLayout };
}
