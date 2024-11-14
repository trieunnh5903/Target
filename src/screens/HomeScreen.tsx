import { ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import Animated from "react-native-reanimated";
import { PostItem, ThemedView } from "@/components";
import { Post } from "@/types";
import { postAPI } from "@/api/postApi";

const HomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    const data = await postAPI.getPosts();
    if (data) {
      setPosts(data);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    (async () => {
      const data = await postAPI.getPosts();
      if (data) {
        setPosts(data);
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

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
      />
    </ThemedView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
});
