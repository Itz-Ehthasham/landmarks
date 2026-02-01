import { useEffect } from "react";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_COMPLETED_KEY } from '../lib/onboardingStorage';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleNavigation = async () => {
      if (loading) return;
      
      try {
        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        
        if (!user) {
          if (!onboardingCompleted) {
            router.replace("/onboarding");
          } else {
            router.replace("/auth/login");
          }
        } else {
          router.replace("/(tabs)/home");
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
        router.replace("/auth/login");
      }
    };

    handleNavigation();
  }, [user, loading]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
