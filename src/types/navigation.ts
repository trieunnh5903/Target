import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import * as MediaLibrary from "expo-media-library";

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList>;
  SignIn: undefined;
  SignUp: undefined;
  EditProfile: undefined;
  EditImage: {
    asset: {
      width: number;
      height: number;
      uri: string;
    };
  };
  CameraScreen: {
    newestImage: MediaLibrary.Asset;
  };
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Create: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type RootTabScreenProps<T extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
