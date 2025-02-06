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
  ListChatRoom: undefined;
  ChatRoom: {
    userId: string;
    displayName: string;
    avatarURL: string;
  };
  PostDetail: {
    postId?: Post["id"];
    posts?: Post[];
    initialScrollIndex?: number;
  };
  UserDetail: {
    userId: string;
    displayName: string;
    avatarURL: string;
    bio: string;
  };
  CreatePost: undefined;
  // CreatePost: {
  //   assets: MediaLibrary.Asset[];
  //   translateAssets: {
  //     [id: string]: {
  //       x: number;
  //       y: number;
  //     };
  //   };
  // };
  EditImage: {
    asset: MediaLibrary.Asset;
    translateOption?: {
      x: number;
      y: number;
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
  Search: undefined;
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
