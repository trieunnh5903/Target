import { StyleSheet } from "react-native";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { CustomAvatar, CustomView } from "@/components";
import { GLOBAL_STYLE, SCREEN_WIDTH, SPACING } from "@/constants";
import { RootTabScreenProps } from "@/types/navigation";
import { FlatList, Pressable, TextInput } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Text } from "react-native-paper";
import { userAPI } from "@/api";
import { useNavigation } from "@react-navigation/native";

type SeachData = {
  displayName: string;
  avatarURL: string;
  id: string;
  bio: string;
};

const SearchScreen: React.FC<RootTabScreenProps<"Search">> = ({
  navigation,
}) => {
  const [query, setQuery] = useState("");
  const [searchData, setSearchData] = useState<SeachData[]>();
  const [isFetching, setIsFetching] = useState(false);
  const onUserPress = (item: SeachData) => {
    navigation.navigate("UserDetail", {
      userId: item.id,
      displayName: item.displayName,
      avatarURL: item.avatarURL,
      bio: item.bio,
    });
  };

  const onChangeText = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim() === "") {
      setSearchData([]);
      return;
    }
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
      <FlatList
        ListFooterComponent={
          <CustomView>
            {isFetching && (
              <CustomView
                padding={SPACING.small}
                style={styles.indicatorContainer}
              >
                <ActivityIndicator size={"small"} />
              </CustomView>
            )}
          </CustomView>
        }
        contentContainerStyle={{ padding: SPACING.small }}
        data={searchData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => onUserPress(item)} style={styles.userItem}>
            <CustomAvatar avatarUrl={item.avatarURL} size={"medium"} />
            <CustomView style={{ marginLeft: SPACING.small }}>
              <Text>{item.displayName}</Text>
            </CustomView>
          </Pressable>
        )}
      />
    </CustomView>
  );
};

interface SearchBarProps {
  onChangeText: (text: string) => void;
  value?: string;
}
const SearchBar: React.FC<SearchBarProps> = ({ onChangeText, value }) => {
  const inputRef = useRef<TextInput>(null);
  const navigation = useNavigation();
  useEffect(() => {
    return navigation.addListener("focus", () => {
      inputRef.current?.focus();
    });
  }, [navigation]);
  return (
    <CustomView style={styles.searchInput}>
      <MaterialCommunityIcons name="magnify" size={24} color="black" />
      <TextInput
        ref={inputRef}
        style={{ flex: 1, marginLeft: 10 }}
        placeholder="Tìm kiếm..."
        value={value}
        onChangeText={onChangeText}
      />
    </CustomView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  userItem: {
    flexDirection: "row",
    padding: SPACING.small,
    alignItems: "center",
  },
  indicatorContainer: {
    // position: "absolute",
    zIndex: 1,
    borderRadius: 100,
    borderColor: "#f0f0f0",
    borderWidth: 1,
    alignSelf: "center",
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
