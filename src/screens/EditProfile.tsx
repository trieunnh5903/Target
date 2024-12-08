import { Modal, Pressable, StyleSheet, View } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Container, CustomAvatar } from "@/components";
import { useAppDispatch, useAppSelector, useValidation } from "@/hooks";
import { Button, IconButton, Text, TextInput } from "react-native-paper";
import { userAPI } from "@/api";
import { generateKeywords } from "@/utils/userUtils";
import { User } from "@/types";
import { updateCurrentUser, updatePhotoURL } from "@/redux/slices/authSlice";
import * as ImagePicker from "expo-image-picker";
import CustomTextInput, { ValidationError } from "@/components/CustomTextInput";

interface ProfileField {
  fieldName: string;
  label: string;
  value: string;
  validation: (value: string) => string | null;
}

const EditProfile = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [selectedField, setSelectedField] = useState<ProfileField | null>(null);
  const dispatch = useAppDispatch();
  const [error, setError] = useState<ValidationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<any>(null);
  const { validateDisplayName } = useValidation();

  useEffect(() => {
    if (selectedField) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [selectedField]);

  const handleCloseModal = () => {
    setSelectedField(null);
    setError(null);
  };

  const profileFields: ProfileField[] = useMemo(
    () => [
      {
        fieldName: "displayName",
        label: "Display name",
        value: currentUser?.displayName ?? "",
        validation: validateDisplayName,
      },
    ],
    [currentUser?.displayName]
  );

  const showError = (
    message: string,
    type: ValidationError["type"] = "error"
  ) => {
    setError({ message, type });
  };

  const handleUpdateField = async () => {
    if (!currentUser || !selectedField) return;
    const validationError = selectedField.validation?.(selectedField.value);
    if (validationError) {
      showError(validationError);
      return;
    }
    setError(null);

    try {
      setIsLoading(true);
      const updateData: Partial<User> =
        selectedField.fieldName === "displayName"
          ? {
              displayName: selectedField.value,
              keywords: generateKeywords(selectedField.value),
            }
          : {
              [selectedField.fieldName]: selectedField.value,
            };

      await userAPI.updateUser(currentUser.id, updateData);
      dispatch(updateCurrentUser({ data: { ...currentUser, ...updateData } }));
      handleCloseModal();
    } catch (error) {
      console.error("Failed to update field:", error);
      showError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

      await userAPI.updateUser(currentUser?.id, {
        photoURL: avtarURL,
      });

      dispatch(updatePhotoURL({ avatarURL: avtarURL }));
    } catch (error) {
      console.log("handleChangePhoto", error);
    }
  };

  return (
    <Container>
      <View style={styles.avatarContainer}>
        <CustomAvatar size={"large"} avatarUrl={currentUser?.avatarURL} />
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

      <Modal
        animationType="slide"
        visible={!!selectedField}
        onRequestClose={handleCloseModal}
      >
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
              ref={inputRef}
              helperText={error}
              onChangeText={(text) => {
                setSelectedField({ ...selectedField, value: text.trim() });
                if (error) setError(null);
              }}
              label={selectedField.label}
              value={selectedField.value}
              maxLength={50}
              right={
                <TextInput.Affix text={`${selectedField.value.length}/50`} />
              }
              editable={!isLoading}
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
