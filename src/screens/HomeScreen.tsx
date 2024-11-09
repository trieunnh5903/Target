import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import React, { useMemo } from "react";
import Animated from "react-native-reanimated";
import postsData from "../../assets/data/post.json";
import { PostItem, ThemedView } from "@/components";
const HomeScreen = () => {
  const posts = useMemo(() => postsData, []);
  return (
    <ThemedView style={{ flex: 1 }}>
      <Animated.FlatList
        overScrollMode="never"
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

const styles = StyleSheet.create({});
