import { StyleSheet, Text, View } from "react-native";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { CustomAvatar, CustomView } from "@/components";
import { GLOBAL_STYLE, SCREEN_WIDTH, SPACING } from "@/constants";
import { RootTabScreenProps } from "@/types/navigation";
import { FlatList, Pressable, TextInput } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import { userAPI } from "@/api";

type SeachData = {
  displayName: string;
  avatarURL: string;
  id: string;
};

const SearchScreen: React.FC<RootTabScreenProps<"Search">> = ({
  navigation,
}) => {
  const [query, setQuery] = useState("");
  const [searchData, setSearchData] = useState<SeachData[]>();
  const [isFetching, setIsFetching] = useState(false);

  const onUserPress = (item: SeachData) => {
    console.log(item);

    navigation.navigate("UserDetail", {
      userId: item.id,
      displayName: item.displayName,
      avatarURL: item.avatarURL,
    });
  };

  const onChangeText = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim() === "") return;
    setIsFetching(true);
    try {
      const users = await userAPI.searchUsersByKeyword(text);
      setSearchData(users);
    } catch {
    } finally {
      setIsFetching(false);
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <SearchBar onChangeText={onChangeText} value={query} />
      ),
      headerTitleStyle: {
        textAlign: "center",
        flex: 1,
      },
    });
    return () => {};
  }, [navigation, onChangeText, query]);

  return (
    <CustomView style={GLOBAL_STYLE.flex_1}>
      {searchData && (
        <FlatList
          contentContainerStyle={{ padding: SPACING.small }}
          data={searchData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onUserPress(item)}
              style={styles.userItem}
            >
              <CustomAvatar avatarUrl={item.avatarURL} size={"medium"} />
              <CustomView style={{ marginLeft: SPACING.small }}>
                <Text>{item.displayName}</Text>
              </CustomView>
            </Pressable>
          )}
        />
      )}
      {isFetching && (
        <CustomView padding={SPACING.small}>
          <ActivityIndicator />
        </CustomView>
      )}
    </CustomView>
  );
};

interface SearchBarProps {
  onChangeText: (text: string) => void;
  value?: string;
}
const SearchBar: React.FC<SearchBarProps> = ({ onChangeText, value }) => {
  return (
    <View style={styles.searchInput}>
      <MaterialCommunityIcons name="magnify" size={24} color="black" />
      <TextInput
        style={{ flex: 1, marginLeft: 10 }}
        placeholder="Tìm kiếm..."
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  userItem: {
    flexDirection: "row",
    padding: SPACING.small,
    alignItems: "center",
  },
  searchInput: {
    width: SCREEN_WIDTH - 40,
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    flexDirection: "row",
    alignItems: "center",
  },
});
