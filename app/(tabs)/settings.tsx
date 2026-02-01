import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "../../contexts/AuthContext";
import { ONBOARDING_COMPLETED_KEY } from '../../lib/onboardingStorage';

// Samsung One UI colors
const COLORS = {
  primary: "#0072DE",
  accent: "#3E91FF",
  background: "#F5F6F8",
  surface: "#FFFFFF",
  textPrimary: "#191919",
  textSecondary: "#6B6B70",
  textTertiary: "#8E8E93",
  divider: "#E8E8ED",
  error: "#DF3333",
};

export default function SettingsScreen() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
            await signOut();
            router.replace("/onboarding");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    router.push("../profile_edit");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        {/* Edit Profile Option */}
        <View style={styles.focusBlock}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleEditProfile}
          >
            <View style={styles.settingContent}>
              <Ionicons name="person-outline" size={24} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Edit Profile</Text>
                <Text style={styles.settingDescription}>
                  Manage your username, bio, and avatar
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Notifications Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Push and email notifications
                </Text>
              </View>
            </View>
            <Ionicons name="toggle" size={24} color={COLORS.primary} />
          </View>

          <View style={styles.divider} />

          {/* About Setting */}
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>About</Text>
                <Text style={styles.settingDescription}>
                  Version 1.0.0
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.focusBlock}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleSignOut}
          >
            <View style={styles.settingContent}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: COLORS.error }]}>
                  Sign Out
                </Text>
                <Text style={styles.settingDescription}>
                  Log out of your account
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  focusBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 16,
  },
});
