import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

export * from "./useNotificationObserver";
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
