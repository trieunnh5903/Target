import { User } from "@/types";
import { usersCollection } from "./collections";

export const getUserById = async (userId: string) => {
  try {
    return (await usersCollection.doc(userId).get()).data() as User;
  } catch (error) {
    console.log("getUserById", error);
  }
};
