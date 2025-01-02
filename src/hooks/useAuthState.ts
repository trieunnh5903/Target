import { useEffect, useState } from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

// Consider extracting auth state logic into a custom hook
export const useAuthState = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return auth().onAuthStateChanged((user) => {
      setUser(user);
      setInitializing(false);
    });
  }, []);

  return { user, initializing };
};
