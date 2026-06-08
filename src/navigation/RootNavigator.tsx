import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../stores/authStore";
import AppTabs from "./AppTabs";
import AuthNavigator from "./AuthNavigator";

export default function RootNavigator() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#059669" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {currentUser ? <AppTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
