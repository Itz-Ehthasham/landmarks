import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function PostScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Media access is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    // @ts-ignore
    const uri = result.assets?.[0]?.uri;
    if (uri) {
      Alert.alert(
        "Use this image?",
        "Do you want to use this picture for your post?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Choose this picture", onPress: () => setImage(uri) },
        ]
      );
    }
  }

  async function submit() {
    if (!title.trim()) {
      Alert.alert("Validation", "Please add a title");
      return;
    }
    if (!image) {
      Alert.alert("Validation", "Please select an image");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "Please log in to create a post");
        return;
      }

      // For now, save without image upload to test database connection
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: image, // Use local URI temporarily
          park_name: title.trim(),
          caption: description.trim(),
          latitude: 0,
          longitude: 0,
        });

      if (postError) throw postError;

      Alert.alert("Success", "Post created!", [
        { text: "OK", onPress: () => {
          setImage(null);
          setTitle("");
          setDescription("");
          router.push("/(tabs)/home");
        }},
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to create post. Please try again.");
      console.error(error);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Create Post</Text>

      <View style={styles.card}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Text style={styles.imageText}>
            {image ? "Change Image" : "Pick Image"}
          </Text>
        </TouchableOpacity>

        {image && <Image source={{ uri: image }} style={styles.preview} />}

        <TextInput
          placeholder="Post title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
        />

        <TouchableOpacity style={styles.submitButton} onPress={submit}>
          <Text style={styles.submitText}>Submit Post</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F2F2F7",
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  imagePicker: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  imageText: {
    color: "#fff",
    fontWeight: "600",
  },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
