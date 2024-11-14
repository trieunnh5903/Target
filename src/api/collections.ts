import firestore from "@react-native-firebase/firestore";

export const usersCollection = firestore().collection("users");
export const postsCollection = firestore().collection("posts");
export const likesCollection = firestore().collection("likes");
