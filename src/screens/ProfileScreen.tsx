import { StyleSheet, View } from "react-native";
import React, { useLayoutEffect } from "react";
import { RootTabScreenProps } from "@/types/navigation";
import { useAppSelector } from "@/hooks";
import { Button } from "react-native-paper";
import { CustomAvatar } from "@/components";

const ProfileScreen: React.FC<RootTabScreenProps<"Profile">> = ({
  navigation,
}) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  useLayoutEffect(() => {
    currentUser?.displayName &&
      navigation.setOptions({
        headerTitle: currentUser.displayName,
      });
    return () => {};
  }, [currentUser?.displayName, navigation]);

  const onEditPress = () => {
    navigation.navigate("EditProfile");
  };

  return (
    <View style={[styles.container]}>
      <View style={{ paddingHorizontal: 20 }}>
        <CustomAvatar size={"large"} avatarUrl={currentUser?.avatarURL} />
        <Button
          mode="contained-tonal"
          buttonColor="#E4E7EC"
          style={{ width: "auto", alignSelf: "flex-start", marginTop: 20 }}
          onPress={onEditPress}
        >
          Edit profile
        </Button>
      </View>

      {/* <Text variant="titleMedium">{currentUser.bio}</Text> */}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  flex_1: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
