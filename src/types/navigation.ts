import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import * as MediaLibrary from "expo-media-library";
import { Post } from ".";

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList>;
  SignIn: undefined;
  SignUp: undefined;
  EditProfile: undefined;
  Notification: undefined;
  PostDetail: {
    postId?: Post["id"];
    posts?: Post[];
    initialScrollIndex?: number;
  };
  CreatePost: {
    assets: MediaLibrary.Asset[];
    translateAssets: {
      [id: string]: {
        x: number;
        y: number;
      };
    };
  };
  EditImage: {
    assets: MediaLibrary.Asset[];
    imageOption?: {
      resizeFull: boolean;
      translateX: number;
      translateY: number;
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
  ImagePicker: undefined;
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
