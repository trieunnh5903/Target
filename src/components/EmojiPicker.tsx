import { Modal, StyleSheet } from "react-native";
import { PropsWithChildren } from "react";
import { Divider, IconButton, Text } from "react-native-paper";
import CustomView from "./CustomView";

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
}>;

export default function EmojiPicker({ isVisible, children, onClose }: Props) {
  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <CustomView style={styles.modalContent}>
        <Divider />
        <CustomView style={[styles.titleContainer]}>
          <Text variant="titleMedium">Choose a sticker</Text>
          <IconButton icon={"close"} onPress={onClose} />
        </CustomView>
        {children}
      </CustomView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    height: "25%",
    width: "100%",
    // backgroundColor: "#25292e",
    position: "absolute",
    bottom: 0,
  },
  titleContainer: {
    // height: "20%",
    // backgroundColor: "#464C55",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
