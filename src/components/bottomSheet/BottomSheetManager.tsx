import { useAppSelector } from "@/hooks";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import CommentBottomSheet, {
  CommentBottomSheetFooter,
} from "./CommentBottomSheet";
import { StatusBar, useWindowDimensions } from "react-native";
import { closeSheet } from "@/redux/slices/bottomSheetSlice";
import { TextInput } from "react-native-gesture-handler";
import { useBackHandler } from "@react-native-community/hooks";

const BottomSheetManager = () => {
  const dispatch = useDispatch();
  const { height } = useWindowDimensions();
  const { isVisible, type, props } = useAppSelector(
    (state) => state.bottomSheet
  );
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(
    () => [height - (StatusBar.currentHeight ?? 0)],
    [height]
  );
  const inputRef = useRef<TextInput>(null);

  useBackHandler(() => {
    if (isVisible) {
      dispatch(closeSheet());
      return true;
    }
    return false;
  });

  console.log("isVisible", isVisible);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
    return () => {};
  }, [isVisible]);

  const handleOnClose = useCallback(() => {
    dispatch(closeSheet());
  }, [dispatch]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const renderContent = useCallback(() => {
    switch (type) {
      case "comment":
        return <CommentBottomSheet {...props} inputRef={inputRef} />;

      default:
        return null;
    }
  }, [props, type]);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => {
      switch (type) {
        case "comment":
          return <CommentBottomSheetFooter {...props} inputRef={inputRef} />;

        default:
          console.log("null");
          return null;
      }
    },
    [type]
  );

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      ref={bottomSheetRef}
      enablePanDownToClose
      onClose={handleOnClose}
      snapPoints={snapPoints}
      footerComponent={renderFooter}
      keyboardBlurBehavior="restore"
      keyboardBehavior="extend"
    >
      {renderContent()}
    </BottomSheet>
  );
};

export default BottomSheetManager;
