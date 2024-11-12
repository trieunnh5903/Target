import { User } from "@/types";
import { usersCollection } from "./collections";

export const searchUsersByDisplayName = async (
  searchTerm: string,
  limit = 10
) => {
  try {
    const searchTermLower = searchTerm.toLowerCase();
    const snapshot = await usersCollection
      .where("keywords", "array-contains", searchTermLower)
      .limit(limit)
      .get();

    const users = snapshot.docs.map((doc) => doc.data());

    return {
      users: users as User[],
      error: null,
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return {
      users: [],
      error: "Có lỗi xảy ra khi tìm kiếm người dùng",
    };
  }
};
