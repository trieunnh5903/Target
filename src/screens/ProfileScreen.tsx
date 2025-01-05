import { StyleSheet, View, ListRenderItem } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { RootTabScreenProps } from "@/types/navigation";
import { useAppSelector } from "@/hooks";
import { Button, Text } from "react-native-paper";
import { CustomAvatar, CustomView } from "@/components";
import { GLOBAL_STYLE, SCREEN_WIDTH, SPACING } from "@/constants";
import { Post } from "@/types";
import { FlatList, Pressable } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ProfileScreen: React.FC<RootTabScreenProps<"Profile">> = ({
  navigation,
}) => {
  const { currentUser, ownPosts } = useAppSelector((state) => state.auth);

  // const [lastPost, setLastPost] =
  //   useState<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(
  //     null
  //   );
  // const [posts, setPosts] = useState<Post[]>([]);

  // useEffect(() => {
  //   if (!currentUser?.id) return;
  //   (async () => {
  //     const posts = await postAPI.fetchAllUserPost(currentUser?.id, lastPost);
  //     setPosts(posts.posts);
  //     setLastPost(posts.lastPost);
  //   })();
  // }, []);

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
    return <ImageEntry item={item} onImagePress={onImagePress} index={index} />;
  };

  return (
    <View style={[styles.container]}>
      <CustomView
        paddingHorizontal={SPACING.medium}
        style={GLOBAL_STYLE.center}
      >
        <CustomAvatar size={"large"} avatarUrl={currentUser?.avatarURL} />
        <Text style={styles.displayName}>{currentUser?.displayName}</Text>
        {currentUser?.bio && <Text style={styles.bio}>{currentUser?.bio}</Text>}

        <Button
          mode="contained-tonal"
          buttonColor="#E4E7EC"
          style={styles.editButton}
          onPress={onEditPress}
        >
          Edit profile
        </Button>
      </CustomView>

      <FlatList
        columnWrapperStyle={{ gap: 1 }}
        style={{ marginTop: SPACING.large }}
        ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        data={ownPosts}
        numColumns={3}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={[GLOBAL_STYLE.flex_1, GLOBAL_STYLE.center]}>
            <Text style={{ fontSize: 16 }}>Create your first post now</Text>
          </View>
        }
      />
    </View>
  );
};

interface ImageEntryProps {
  item: Post;
  onImagePress: (index: number) => void;
  index: number;
}
const ImageEntry: React.FC<ImageEntryProps> = ({
  item,
  onImagePress,
  index,
}) => {
  return (
    <Pressable
      onPress={() => onImagePress(index)}
      style={styles.imageContainer}
    >
      <Image
        source={item.images[0].thumbnailUrl.source}
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
