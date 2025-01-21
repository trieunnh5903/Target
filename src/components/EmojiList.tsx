import { useState } from "react";
import { StyleSheet, FlatList, Platform, Pressable, Text } from "react-native";
import { Image, type ImageSource } from "expo-image";

type Props = {
  onSelect: (image: string) => void;
  onCloseModal: () => void;
};

export default function EmojiList({ onSelect, onCloseModal }: Props) {
  const [emoji] = useState<string[]>([
    "\u2764", // ❤
    "\u{1F64C}", // 🙌
    "\u{1F60E}", // 😎
    "\u{1F600}", // 😀
    "\u{1F601}", // 😁
    "\u{1F602}", // 😂
    "\u{1F923}", // 🤣
    "\u{1F60A}", // 😊
    "\u{1F60D}", // 😍
    "\u{1F914}", // 🤔
    "\u{1F44D}", // 👍
    "\u{1F44C}", // 👌
  ]);

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={Platform.OS === "web"}
      data={emoji}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item, index }) => (
        <Pressable
          onPress={() => {
            onSelect(item);
            onCloseModal();
          }}
        >
          {/* <Text source={item} key={index} style={styles.image} /> */}
          <Text>{item}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 20,
  },
});
