import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_COMPLETED_KEY } from '../lib/onboardingStorage';

const LOG = (location: string, message: string, data: Record<string, unknown>, hypothesisId: string) => {
  fetch('http://127.0.0.1:7242/ingest/cecf8d1c-a5c4-4ca4-87b5-1017e063e75b', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location, message, data, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId }) }).catch(() => {});
};

export default function Index() {
  const { user, loading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    // #region agent log
    LOG('index.tsx:checkOnboarding:entry', 'checkOnboarding called', { loading, user: user?.email ?? null, checkingOnboarding }, 'H2');
    // #endregion
    try {
      const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      // #region agent log
      LOG('index.tsx:afterGetItem', 'AsyncStorage value read', { onboardingCompleted, key: ONBOARDING_COMPLETED_KEY, truthy: !!onboardingCompleted }, 'H1');
      // #endregion

      if (!loading) {
        if (!onboardingCompleted) {
          // #region agent log
          LOG('index.tsx:branch', 'Taking onboarding branch', { route: '/onboarding' }, 'H3');
          // #endregion
          router.replace("/onboarding");
        } else if (user) {
          // #region agent log
          LOG('index.tsx:branch', 'Taking tabs branch', { route: '/(tabs)/home' }, 'H4');
          // #endregion
          router.replace("/(tabs)/home");
        } else {
          // #region agent log
          LOG('index.tsx:branch', 'Taking login branch', { route: '/auth/login' }, 'H4');
          // #endregion
          router.replace("/auth/login");
        }
      } else {
        // #region agent log
        LOG('index.tsx:branch', 'Skipped: loading still true', { loading }, 'H3');
        // #endregion
      }
    } catch (error) {
      // #region agent log
      LOG('index.tsx:catch', 'checkOnboarding error', { error: String(error) }, 'H5');
      // #endregion
      console.error('Error checking onboarding:', error);
    } finally {
      setCheckingOnboarding(false);
      // #region agent log
      LOG('index.tsx:finally', 'checkingOnboarding set false', {}, 'H2');
      // #endregion
    }
  };

  useEffect(() => {
    // #region agent log
    LOG('index.tsx:useEffect2', 'Second useEffect ran', { loading, checkingOnboarding, user: user?.email ?? null }, 'H2');
    // #endregion
    if (!loading && !checkingOnboarding) {
      checkOnboarding();
    }
  }, [user, loading]);

  if (loading || checkingOnboarding) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
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
