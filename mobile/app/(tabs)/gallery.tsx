import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/context/auth';
import { GradientButton } from '@/components/gradient-button';
import { EmptyState } from '@/components/empty-state';
import { API_BASE_URL, authHeaders, getErrorMessage } from '@/lib/api';

const CLOUDINARY_CLOUD_NAME = 'tmtzqmmh';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = 'lovelle_uploads';

type Photo = {
  _id: string;
  url: string;
  thumbUrl: string;
  caption?: string;
  width: number;
  height: number;
};

type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
};

export default function GalleryScreen() {
  const { session } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [caption, setCaption] = useState('');
  const [featuredPhotoId, setFeaturedPhotoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadPhotos = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/photos`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    setPhotos(await response.json());
  };

  useEffect(() => {
    if (!session?.token) return;
    loadPhotos(session.token).catch((error: Error) => {
      console.log('[Gallery] load photos error:', error);
      setMessage(error.message);
    });
  }, [session?.token]);

  const pickAndUploadPhoto = async () => {
    if (!session?.token) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage('Photo library permission is required to choose an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setLoading(true);
    setMessage('');
    try {
      const formData = new FormData();
      const imageResponse = await fetch(asset.uri);
      const imageBlob = await imageResponse.blob();
      formData.append(
        'file',
        imageBlob,
        asset.fileName || `lovelle-${Date.now()}.jpg`,
      );
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      console.log('[Cloudinary] upload request:', JSON.stringify({
        url: CLOUDINARY_UPLOAD_URL,
        upload_preset: CLOUDINARY_UPLOAD_PRESET,
        upload_preset_length: CLOUDINARY_UPLOAD_PRESET.length,
        upload_preset_char_codes: Array.from(CLOUDINARY_UPLOAD_PRESET).map((character) => character.charCodeAt(0)),
      }));

      const cloudinaryResponse = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });
      const cloudinaryBody = await cloudinaryResponse.text();
      console.log('[Cloudinary] upload response status:', cloudinaryResponse.status);
      console.log('[Cloudinary] upload response body:', cloudinaryBody);
      if (!cloudinaryResponse.ok) {
        throw new Error(`Cloudinary upload failed (${cloudinaryResponse.status}): ${cloudinaryBody}`);
      }

      const cloudinaryPhoto = JSON.parse(cloudinaryBody) as CloudinaryUploadResult;
      const backendResponse = await fetch(`${API_BASE_URL}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(session.token),
        },
        body: JSON.stringify({
          cloudinaryPublicId: cloudinaryPhoto.public_id,
          url: cloudinaryPhoto.secure_url,
          thumbUrl: cloudinaryPhoto.secure_url,
          width: cloudinaryPhoto.width,
          height: cloudinaryPhoto.height,
          caption: caption.trim(),
        }),
      });
      if (!backendResponse.ok) throw new Error(await getErrorMessage(backendResponse));

      const savedPhoto: Photo = await backendResponse.json();
      setPhotos((currentPhotos) => [savedPhoto, ...currentPhotos]);
      setCaption('');
    } catch (error) {
      console.log('[Gallery] full upload error:', error);
      setMessage(error instanceof Error ? error.message : 'Could not upload photo');
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = (photoId: string) => {
    if (!session?.token) return;
    Alert.alert('Delete photo?', 'This removes the photo record from Lovelle.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/photos/${photoId}`, {
              method: 'DELETE',
              headers: authHeaders(session.token),
            });
            if (!response.ok) throw new Error(await getErrorMessage(response));
            setPhotos((currentPhotos) => currentPhotos.filter((photo) => photo._id !== photoId));
          } catch (error) {
            console.log('[Gallery] full delete error:', error);
            setMessage(error instanceof Error ? error.message : 'Could not delete photo');
          }
        },
      },
    ]);
  };

  const setAsPhotoFrame = async (photoId: string) => {
    if (!session?.token) return;
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/couples/featured-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(session.token),
        },
        body: JSON.stringify({ photoId }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setFeaturedPhotoId(photoId);
      setMessage('Photo Frame updated');
    } catch (error) {
      console.log('[Gallery] set featured photo error:', error);
      setMessage(error instanceof Error ? error.message : 'Could not set Photo Frame');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gallery</Text>
      <Text style={styles.subtitle}>Shared memories</Text>
      <TextInput
        style={styles.input}
        placeholder="Caption (optional)"
        value={caption}
        onChangeText={setCaption}
      />
      <GradientButton style={styles.button} onPress={pickAndUploadPhoto} disabled={loading}>
        {loading ? <ActivityIndicator color="#fcfaff" /> : <Text style={styles.buttonText}>Choose and upload photo</Text>}
      </GradientButton>
      {!!message && <Text style={styles.error}>{message}</Text>}
      <FlatList
        data={photos}
        keyExtractor={(photo) => photo._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={<EmptyState message="Your favorite memories will live here." />}
        renderItem={({ item }) => (
          <View style={styles.photoCard}>
            <Image source={{ uri: item.thumbUrl || item.url }} style={styles.photo} contentFit="cover" />
            {!!item.caption && <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>}
            <View style={styles.photoActions}>
              <Pressable style={styles.frameButton} onPress={() => setAsPhotoFrame(item._id)}>
                <Text style={styles.frameButtonText}>{featuredPhotoId === item._id ? 'Photo Frame' : 'Set as Frame'}</Text>
              </Pressable>
              <Pressable onPress={() => deletePhoto(item._id)} hitSlop={8}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 72, backgroundColor: '#f4efff' },
  title: { fontSize: 32, fontWeight: '700', color: '#302443', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#766889', marginBottom: 20 },
  input: { backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, padding: 14, fontSize: 16, marginBottom: 12, color: '#302443' },
  button: { minHeight: 50, backgroundColor: '#7651b8', borderRadius: 18, padding: 15, alignItems: 'center', justifyContent: 'center', shadowColor: '#2e2050', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 },
  buttonText: { color: '#fcfaff', fontSize: 16, fontWeight: '700' },
  error: { color: '#9b496e', marginTop: 12 },
  grid: { paddingTop: 16, paddingBottom: 24 },
  row: { gap: 10, marginBottom: 10 },
  empty: { color: '#766889', paddingTop: 24 },
  photoCard: { flex: 1, backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, overflow: 'hidden', shadowColor: '#2e2050', shadowOpacity: 0.08, shadowRadius: 9, elevation: 2 },
  photo: { width: '100%', aspectRatio: 1 },
  caption: { color: '#302443', padding: 8, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  photoActions: { padding: 8, gap: 8 },
  frameButton: { backgroundColor: '#d9c5f4', borderRadius: 14, padding: 8, alignItems: 'center' },
  frameButtonText: { color: '#62409d', fontSize: 13, fontWeight: '700' },
  delete: { color: '#9b496e', fontWeight: '700', textAlign: 'center', paddingVertical: 4 },
});
