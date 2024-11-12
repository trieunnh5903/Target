export type Post = {
  id: string;
  postedBy: User;
  content: string;
  images: string;
  createdAt: { nanoseconds: number; seconds: number };
  likes?: string[];
};

export type User = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  creationTime: string;
  lastSignInTime: string;
  phoneNumber: string | null;
  keywords: string[] | null;
};
