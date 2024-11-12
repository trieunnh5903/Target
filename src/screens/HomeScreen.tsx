import { ActivityIndicator, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import Animated from "react-native-reanimated";
import { PostItem, ThemedView } from "@/components";
import { Post } from "@/types";
import { getPosts } from "@/services/postService";

const HomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getPosts();
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
        refre
        scrollEventThrottle={16}
        data={posts}
        renderItem={({ item }) => {
          return <PostItem data={item} />;
        }}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
});
