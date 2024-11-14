import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Animated from "react-native-reanimated";
import { PostItem, ThemedView } from "@/components";
import { Post } from "@/types";
import { postAPI } from "@/api/postApi";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

const HomeScreen = () => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastPost, setLastPost] =
    useState<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(
      null
    );

  const onRefresh = React.useCallback(async () => {
    try {
      const data = await postAPI.getPosts({ limit: 10 });
      setPosts(data.posts);
      setLastPost(data.lastPost);
      setRefreshing(false);
    } catch (error) {
      console.log("onRefresh", error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await postAPI.getPosts({ limit: 10 });
        setPosts(data.posts);
        setLastPost(data.lastPost);
      } catch (error) {
        console.log("getPosts", error);
      }
    })();
  }, []);

  const handleLoadMore = async () => {
    if (!lastPost || loading) return;
    try {
      setLoading(true);
      const data = await postAPI.getPosts({ limit: 10, lastPost });
      setPosts([...posts, ...data.posts]);
      setLastPost(data.lastPost);
    } catch (error) {
      console.log("handleLoadMore", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.FlatList
        overScrollMode="never"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEventThrottle={16}
        data={posts}
        renderItem={({ item }) => {
          return <PostItem data={item} />;
        }}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<ActivityIndicator size="large" />}
        ListFooterComponent={
          <View style={styles.loadingContainer}>
            {loading && <ActivityIndicator size="large" />}
          </View>
        }
      />
    </ThemedView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  loadingContainer: {
    padding: 16,
  },
});
