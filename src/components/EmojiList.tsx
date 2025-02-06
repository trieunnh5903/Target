import { useMemo } from "react";
import { StyleSheet, Pressable } from "react-native";
import { SvgProps } from "react-native-svg";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { EMOJIS } from "@/constants";

type Props = {
  onSelect: (emoji: { id: string; component: React.FC<SvgProps> }) => void;
  onCloseModal: () => void;
};

export default function EmojiList({ onSelect, onCloseModal }: Props) {
  const emojis = useMemo(() => EMOJIS, []);

  const renderItem: ListRenderItem<{
    id: string;
    component: React.FC<SvgProps>;
  }> = ({ item }) => {
    const SvgComponent = item.component;
    return (
      <Pressable
        onPress={() => {
          onSelect(item);
          onCloseModal();
        }}
      >
        <SvgComponent width={90} height={90} />
      </Pressable>
    );
  };

  return (
    <FlashList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={emojis}
      contentContainerStyle={styles.listContainer}
      renderItem={renderItem}
      estimatedItemSize={90}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
  },
});
