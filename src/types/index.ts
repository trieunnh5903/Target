export type Post = {
  id: string;
  postedBy: User;
  content: string;
  images: string;
  createdAt: { nanoseconds: number; seconds: number };
  likes?: { [userId: string]: boolean };
  likesCount?: number;
};

export type User = {
  uid: string;
  displayName: string | null;
  email: string;
  photoURL: string | null;
  creationTime: string;
  lastSignInTime: string;
  phoneNumber: string | null;
  keywords: string[] | null;
};
