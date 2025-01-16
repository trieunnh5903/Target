import { ListRenderItem, StyleSheet } from "react-native";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { RootStackScreenProps } from "@/types/navigation";
import { CustomAvatar, CustomView } from "@/components";
import { GLOBAL_STYLE, SCREEN_WIDTH, SPACING } from "@/constants";
import { FlatList, Pressable } from "react-native-gesture-handler";
import { Divider, IconButton, Text } from "react-native-paper";
import { Post } from "@/types";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { postAPI } from "@/api";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { ListSkeleton } from "@/components/skeleton";

const UserDetailScreen: React.FC<RootStackScreenProps<"UserDetail">> = ({
  navigation,
  route,
}) => {
  const { userId, displayName, avatarURL, bio } = route.params;
  const [lastPost, setlastPost] =
    useState<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>();
  const [isFetching, setIsFetching] = useState(false);
  const [post, setPost] = useState<Post[]>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
    });
    return () => {};
  }, [displayName, navigation]);

  useEffect(() => {
    (async () => {
      try {
        setIsFetching(true);
        const { lastPost: lastItem, posts } = await postAPI.fetchAllUserPost(
          userId,
          lastPost
        );

        setPost(posts);
        setlastPost(lastItem);
      } catch {
      } finally {
        setIsFetching(false);
      }
    })();
  }, [lastPost, userId]);

  const onImagePress = useCallback(
    (index: number) => {
      navigation.navigate("PostDetail", {
        posts: post,
        initialScrollIndex: index,
      });
    },
    [navigation, post]
  );

  const onChatPress = () =>
    navigation.navigate("ChatRoom", { userId, displayName, avatarURL });
  const renderItem: ListRenderItem<Post> = ({ item, index }) => {
    return (
      <ImageEntry
        item={item}
        onImagePress={() => onImagePress(index)}
        index={index}
      />
    );
  };
  return (
    <CustomView style={[styles.container]}>
      <CustomView
        paddingHorizontal={SPACING.medium}
        style={GLOBAL_STYLE.center}
      >
        <CustomAvatar size={"large"} avatarUrl={avatarURL} />
        <Text style={styles.displayName}>{displayName}</Text>
        {bio && <Text style={styles.bio}>{bio}</Text>}

        <IconButton
          mode="contained-tonal"
          icon={"chat-outline"}
          style={styles.editButton}
          containerColor="#f0f0f0"
          onPress={onChatPress}
        ></IconButton>
      </CustomView>

      <Divider />

      {isFetching ? (
        <ListSkeleton />
      ) : (
        <FlatList
          columnWrapperStyle={{ gap: 1 }}
          ItemSeparatorComponent={() => <CustomView style={{ height: 1 }} />}
          data={post}
          numColumns={3}
          renderItem={renderItem}
          ListEmptyComponent={
            <CustomView style={[GLOBAL_STYLE.flex_1, GLOBAL_STYLE.center]}>
              <Text style={{ fontSize: 16 }}>User has no posts yet</Text>
            </CustomView>
          }
        />
      )}
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

export default UserDetailScreen;

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
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  editButton: { alignSelf: "center", marginVertical: SPACING.small },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: SPACING.small,
  },
  bio: {
    fontSize: 16,
    marginVertical: SPACING.small,
  },
});
