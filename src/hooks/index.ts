import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

export * from "./useValidation";
export * from "./useCropDimensions";
export * from "./useCropGesture";
export * from "./useOriginImageLayout";
export * from "./useMediaLoader";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
