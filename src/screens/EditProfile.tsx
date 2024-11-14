import { Modal, Pressable, StyleSheet, View } from "react-native";
import React, { useMemo, useState } from "react";
import { Container, CustomTextInput } from "@/components";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { Avatar, Button, IconButton, Text } from "react-native-paper";
import { userAPI } from "@/api";
import { generateKeywords } from "@/utils/userUtils";
import { User } from "@/types";
import { updateCurrentUser, updatePhotoURL } from "@/redux/slices/authSlice";
import * as ImagePicker from "expo-image-picker";

interface ProfileField {
  fieldName: string;
  label: string;
  value: string;
}

const EditProfile = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [selectedField, setSelectedField] = useState<ProfileField | null>(null);
  const dispatch = useAppDispatch();

  const profileFields: ProfileField[] = useMemo(
    () => [
      {
        fieldName: "displayName",
        label: "Display name",
        value: currentUser?.displayName ?? "",
      },
    ],
    [currentUser?.displayName]
  );

  const handleUpdateField = async () => {
    if (!currentUser || !selectedField) return;
    try {
      const updateData: Partial<User> =
        selectedField.fieldName === "displayName"
          ? {
              displayName: selectedField.value,
              keywords: generateKeywords(selectedField.value),
            }
          : {
              [selectedField.fieldName]: selectedField.value,
            };

      await userAPI.updateUser(currentUser.uid, updateData);
      dispatch(updateCurrentUser({ data: { ...currentUser, ...updateData } }));
      setSelectedField(null);
    } catch (error) {
      console.error("Failed to update field:", error);
    }
  };

  const renderAvatar = () => {
    if (currentUser?.photoURL) {
      return (
        <Avatar.Image
          size={90}
          source={{ uri: currentUser.photoURL }}
          style={styles.avatar}
          //bg  color primary
        />
      );
    }

    if (currentUser?.displayName) {
      return (
        <Avatar.Text size={90} label={currentUser.displayName.slice(0, 1)} />
      );
    }

    return <Avatar.Icon size={90} icon="account-circle-outline" />;
  };

  const handleChangePhoto = async () => {
    try {
      console.log("handleChangePhoto");
      if (!currentUser) return;
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      const avtarURL = await userAPI.uploadAvatar(asset);
      await userAPI.updateUser(currentUser?.uid, {
        photoURL: avtarURL,
      });
      dispatch(updatePhotoURL({ photoURL: avtarURL }));
    } catch (error) {
      console.log("handleChangePhoto", error);
    }
  };

  return (
    <Container>
      <View style={styles.avatarContainer}>
        {renderAvatar()}
        <Button
          textColor="black"
          style={{ alignSelf: "center" }}
          onPress={handleChangePhoto}
        >
          Change photo
        </Button>
      </View>

      <View style={styles.fieldsContainer}>
        {profileFields.map((field) => (
          <Pressable key={field.label} onPress={() => setSelectedField(field)}>
            <CustomTextInput
              label={field.label}
              editable={false}
              value={field.value}
            />
          </Pressable>
        ))}
      </View>

      <Modal animationType="slide" visible={!!selectedField}>
        <View style={styles.modalHeader}>
          <IconButton icon={"close"} onPress={() => setSelectedField(null)} />
          <Text variant="titleLarge" style={styles.modalTitle}>
            {selectedField?.label}
          </Text>
          <IconButton
            iconColor="green"
            icon={"check"}
            onPress={handleUpdateField}
          />
        </View>

        <View style={styles.modalContent}>
          {selectedField && (
            <CustomTextInput
              onChangeText={(text) => {
                setSelectedField({ ...selectedField, value: text.trim() });
              }}
              label={selectedField.label}
              value={selectedField.value}
            />
          )}
        </View>
      </Modal>
    </Container>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 24,
  },

  modalTitle: {
    fontWeight: "700",
    flex: 1,
  },
  container: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  avatar: {
    backgroundColor: "white",
  },
  fieldsContainer: {
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  modalContent: {
    paddingHorizontal: 16,
  },
});
