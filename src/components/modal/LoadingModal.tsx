import { StyleSheet, View } from "react-native";
import React from "react";
import { ActivityIndicator, Modal, Portal, Text } from "react-native-paper";
import CustomView from "../CustomView";
import { GLOBAL_STYLE, SPACING } from "@/constants";

interface LoadingModalProps {
  visible: boolean;
  loadingContent: string;
}
const LoadingModal: React.FC<LoadingModalProps> = ({
  loadingContent,
  visible,
}) => {
  return (
    <Portal>
      <Modal visible={visible} dismissable={false}>
        <CustomView
          padding={SPACING.medium}
          style={[
            GLOBAL_STYLE.rowCenter,
            {
              gap: SPACING.small,
              alignSelf: "center",
              borderRadius: SPACING.medium,
            },
          ]}
        >
          <ActivityIndicator />
          <Text variant="titleSmall">{loadingContent}</Text>
        </CustomView>
      </Modal>
    </Portal>
  );
};

export default LoadingModal;

const styles = StyleSheet.create({});
