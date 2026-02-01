import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { fetchProfile, updateProfile, getAvatarPublicUrl } from "../../lib/profile";
import { supabase } from "../../lib/supabase";

// Samsung One UI colors
const COLORS = {
  primary: "#0072DE",
  primaryLight: "#0381FE",
  accent: "#3E91FF",
  background: "#F5F6F8",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  textPrimary: "#191919",
  textSecondary: "#6B6B70",
  textTertiary: "#8E8E93",
  divider: "#E8E8ED",
  error: "#DF3333",
};

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{
    username: string;
    bio: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    const p = await fetchProfile(user.id);
    if (p) {
      setProfile(p);
      setUsername(p.username);
      setBio(p.bio ?? "");
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async () => {
    if (!user?.id || saving) return;
    setSaving(true);
    const { error } = await updateProfile(user.id, {
      username: username.trim() || profile?.username,
      bio: bio.trim() || null,
    });
    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      loadProfile();
    }
  };

  const pickImage = async () => {
    if (!user?.id || uploadingAvatar) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingAvatar(true);
    try {
      const asset = result.assets[0];
      const ext = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const contentType = `image/${ext === "jpg" || ext === "jpeg" ? "jpeg" : ext}`;

      // Use new Expo File API - pass URI string from ImagePicker
      const file = new File(asset.uri);
      const arrayBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, arrayBuffer, {
          upsert: true,
          contentType,
        });

      if (uploadError) {
        Alert.alert("Upload failed", uploadError.message);
        setUploadingAvatar(false);
        return;
      }

      const { error: updateError } = await updateProfile(user.id, {
        avatar_url: path,
      });
      if (updateError) {
        Alert.alert("Error", "Failed to update profile.");
      } else {
        setProfile((prev) => (prev ? { ...prev, avatar_url: path } : null));
      }
    } catch (e: any) {
      console.error("Upload error:", e);
      Alert.alert("Error", e?.message || "Failed to upload image.");
    }
    setUploadingAvatar(false);
  };

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
            await signOut();
            router.replace("/auth/login");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const avatarUrl = profile?.avatar_url
    ? getAvatarPublicUrl(profile.avatar_url)
    : null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section - Samsung focus block */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.focusBlock}>
            <View style={styles.avatarRow}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={pickImage}
                disabled={uploadingAvatar}
              >
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons
                      name="person"
                      size={48}
                      color={COLORS.textTertiary}
                    />
                  </View>
                )}
                {uploadingAvatar && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color="#fff" size="small" />
                  </View>
                )}
                <View style={styles.avatarEditBadge}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
              <View style={styles.avatarLabel}>
                <Text style={styles.tapHint}>Tap to change</Text>
                <Text style={styles.email}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                onBlur={handleSaveProfile}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onBlur={handleSaveProfile}
              />
            </View>

            {saving && (
              <View style={styles.savingRow}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.savingText}>Saving...</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sign Out - small button bottom left */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
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
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarLabel: {
    marginLeft: 20,
    flex: 1,
  },
  tapHint: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: "500",
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 14,
  },
  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  savingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
    backgroundColor: COLORS.error,
    borderRadius: 10,
  },
  signOutText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
});
