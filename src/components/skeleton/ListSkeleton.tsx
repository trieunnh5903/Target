import React from "react";
import { View, StyleSheet, FlatList, Dimensions } from "react-native";

const SkeletonList = () => {
  const screenWidth = Dimensions.get("window").width; // Lấy chiều rộng màn hình
  const numColumns = 3; // Số cột
  const gap = 1; // Khoảng cách giữa các ô
  const itemSize = (screenWidth - gap * (numColumns - 1)) / numColumns; // Tính kích thước hình vuông

  // Dữ liệu giả để hiển thị Skeleton
  const data = Array.from({ length: 12 }, (_, index) => index.toString());

  const renderItem = () => (
    <View
      style={[styles.skeletonItem, { width: itemSize, height: itemSize }]}
    />
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item}
      renderItem={renderItem}
      numColumns={numColumns}
      columnWrapperStyle={{ gap }} // Khoảng cách giữa các cột
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    gap: 1, // Khoảng cách giữa các hàng
  },
  skeletonItem: {
    backgroundColor: "#e0e0e0",
  },
});

export default SkeletonList;
