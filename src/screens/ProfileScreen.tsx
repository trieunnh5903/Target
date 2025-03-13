import { StyleSheet, ListRenderItem } from "react-native";
import React, { useCallback } from "react";
import { RootTabScreenProps } from "@/types/navigation";
import { useAppSelector } from "@/hooks";
import { Button, Text, useTheme } from "react-native-paper";
import { CustomAvatar, CustomView } from "@/components";
import { GLOBAL_STYLE, SCREEN_WIDTH, SPACING } from "@/constants";
import { Post } from "@/types";
import { Image } from "expo-image";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { FlatList, Pressable } from "react-native-gesture-handler";

const ProfileScreen: React.FC<RootTabScreenProps<"Profile">> = ({
  navigation,
}) => {
  const { currentUser, ownPosts } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const onEditPress = () => {
    navigation.navigate("EditProfile");
  };

  const onImagePress = useCallback(
    (index: number) => {
      navigation.navigate("PostDetail", {
        posts: ownPosts,
        initialScrollIndex: index,
      });
    },
    [navigation, ownPosts]
  );

  const renderItem: ListRenderItem<Post> = ({ item, index }) => {
    return <ImageEntry index={index} onImagePress={onImagePress} item={item} />;
  };

  return (
    <CustomView style={[styles.container]}>
      <CustomView
        paddingHorizontal={SPACING.medium}
        paddingBottom={SPACING.medium}
        style={GLOBAL_STYLE.center}
      >
        <CustomAvatar size={"large"} avatarUrl={currentUser?.avatarURL} />
        <CustomView>
          <Text style={styles.displayName}>{currentUser?.displayName}</Text>
          {currentUser?.verified && (
            <MaterialIcons
              name="verified"
              size={24}
              color="rgb(0,149,246)"
              style={styles.verified}
            />
          )}
        </CustomView>
        {currentUser?.bio && <Text style={styles.bio}>{currentUser?.bio}</Text>}

        <Button
          mode="contained-tonal"
          style={styles.editButton}
          onPress={onEditPress}
        >
          Edit profile
        </Button>
      </CustomView>

      <FlatList
        style={{
          backgroundColor: theme.colors.background,
        }}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: 1 }}
        ItemSeparatorComponent={() => <CustomView style={{ height: 1 }} />}
        data={ownPosts}
        numColumns={3}
        renderItem={renderItem}
        ListEmptyComponent={
          <CustomView style={[GLOBAL_STYLE.flex_1, GLOBAL_STYLE.center]}>
            <Text style={{ fontSize: 16 }}>Create your first post now</Text>
          </CustomView>
        }
      />
    </CustomView>
  );
};

interface ImageEntryProps {
  item: Post;
  onImagePress: (index: number) => void;
  index: number;
}
const ImageEntry: React.FC<ImageEntryProps> = ({
  item,
  index,
  onImagePress,
}) => {
  return (
    <Pressable
      onPress={() => onImagePress(index)}
      style={styles.imageContainer}
    >
      <Image
        source={item?.images[0]?.thumbnailUrl?.source}
        style={GLOBAL_STYLE.fullSize}
      />
      {item.images.length > 1 && (
        <MaterialCommunityIcons
          name="checkbox-multiple-blank-outline"
          size={22}
          style={styles.multipleImage}
          color={"white"}
        />
      )}
    </Pressable>
  );
};
export default ProfileScreen;

const styles = StyleSheet.create({
  verified: { position: "absolute", top: 10, right: -26 },
  imageContainer: {
    flex: 1,
    width: "100%",
    aspectRatio: 1,
    maxWidth: SCREEN_WIDTH / 3,
  },
  multipleImage: {
    position: "absolute",
    top: SPACING.small,
    right: SPACING.small,
    zIndex: 1,
  },
  flex_1: {
    flex: 1,
  },
  editButton: { width: "auto", alignSelf: "center", marginTop: SPACING.small },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: SPACING.small,
  },
  bio: {
    fontSize: 16,
    marginVertical: SPACING.small,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
