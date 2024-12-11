import React from "react";
import ContentLoader, {
  Rect,
  Circle,
  IContentLoaderProps,
} from "react-content-loader/native";

const MyLoader = (props: IContentLoaderProps) => (
  <ContentLoader
    height={60}
    speed={1}
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <Circle cx={20} cy={30} r="20" />
    <Rect x="48" y="18" rx="2" ry="2" width="100%" height="10" />
    <Rect x="48" y="34" rx="2" ry="2" width="70%" height="10" />
  </ContentLoader>
);

export default MyLoader;
