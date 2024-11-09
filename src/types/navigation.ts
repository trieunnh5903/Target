import { NavigatorScreenParams } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
};

export type AuthStackParamList = {
  SignIn: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Create: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
