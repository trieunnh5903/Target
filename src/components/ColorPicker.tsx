import { StyleSheet, View } from "react-native";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { SPACING } from "@/constants";
import { TagColors } from "@/config/theme";

interface ColorPickerProps {
  onColorPress: (color: string) => void;
}
const ColorPicker: React.FC<ColorPickerProps> = ({ onColorPress }) => {
  const tagColors = useMemo(() => TagColors, []);
  const [selectedColor, setSelectedColor] = useState(tagColors[1]);

  const handleColorPress = (value: string) => {
    setSelectedColor(value);
    onColorPress(value);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ alignSelf: "flex-end" }}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{
          padding: SPACING.small,
          gap: SPACING.large,
        }}
      >
        {tagColors.map((color) => (
          <Pressable key={color} onPress={() => handleColorPress(color)}>
            <View
              style={{
                backgroundColor: color,
                width: 20,
                height: 20,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "white",
                transform: [{ scale: selectedColor === color ? 1.3 : 1 }],
              }}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default ColorPicker;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: SPACING.small,
  },
});
