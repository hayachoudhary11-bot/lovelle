import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/context/auth';
import { API_BASE_URL, authHeaders, getErrorMessage } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const COLORS = ['#302443', '#d93688', '#7651b8', '#9078b8', '#6d9b91', '#e4a52f'];
const DEFAULT_STROKE_WIDTH = 4;

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  _id?: string;
  points: Point[];
  color: string;
  strokeWidth: number;
  createdBy?: string;
};

function pointsToPath(points: Point[]) {
  if (!points.length) return '';
  return points.reduce(
    (path, point, index) => `${path}${index === 0 ? 'M' : ' L'} ${point.x} ${point.y}`,
    '',
  );
}

export default function DrawingScreen() {
  const colors = Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const { session } = useAuth();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const drawingPointsRef = useRef<Point[]>([]);
  const selectedColorRef = useRef(selectedColor);
  selectedColorRef.current = selectedColor;

  useEffect(() => {
    if (!session?.token) return;
    let mounted = true;
    const socket = io(API_BASE_URL, {
      auth: { token: session.token },
    });
    socketRef.current = socket;

    const loadStrokes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/drawing/strokes`, {
          headers: authHeaders(session.token),
        });
        if (!response.ok) throw new Error(await getErrorMessage(response));
        if (mounted) setStrokes(await response.json());
      } catch (error) {
        if (mounted) setMessage(error instanceof Error ? error.message : 'Could not load drawing');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const handleConnect = () => socket.emit('join-board');
    const handleStroke = (stroke: Stroke) => {
      if (mounted) setStrokes((currentStrokes) => [...currentStrokes, stroke]);
    };
    const handleBoardCleared = () => {
      if (mounted) setStrokes([]);
    };

    socket.on('connect', handleConnect);
    socket.on('stroke', handleStroke);
    socket.on('board-cleared', handleBoardCleared);
    socket.on('connect_error', (error) => {
      if (mounted) setMessage(`Drawing connection failed: ${error.message}`);
    });
    loadStrokes();

    return () => {
      mounted = false;
      socket.off('connect', handleConnect);
      socket.off('stroke', handleStroke);
      socket.off('board-cleared', handleBoardCleared);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.token]);

  const finishStroke = () => {
    const points = drawingPointsRef.current;
    if (!points.length) return;
    const stroke: Stroke = {
      points,
      color: selectedColorRef.current,
      strokeWidth: DEFAULT_STROKE_WIDTH,
    };
    setStrokes((currentStrokes) => [...currentStrokes, stroke]);
    socketRef.current?.emit('stroke', stroke, (response: { error?: string }) => {
      if (response?.error) setMessage(response.error);
    });
    drawingPointsRef.current = [];
    setCurrentPoints([]);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const point = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
        drawingPointsRef.current = [point];
        setCurrentPoints([point]);
      },
      onPanResponderMove: (event) => {
        const point = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
        drawingPointsRef.current = [...drawingPointsRef.current, point];
        setCurrentPoints((points) => [...points, point]);
      },
      onPanResponderRelease: finishStroke,
      onPanResponderTerminate: finishStroke,
    }),
  ).current;

  const clearBoard = async () => {
    if (!session?.token) return;
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/drawing/strokes`, {
        method: 'DELETE',
        headers: authHeaders(session.token),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setStrokes([]);
      setCurrentPoints([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not clear drawing');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroIcon}>
          <IconSymbol name="drawing" size={24} color="#fff8fc" />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>A LITTLE SPACE TO PLAY</Text>
          <Text style={styles.heroTitle}>Draw something together</Text>
          <Text style={styles.heroSubtitle}>Leave a doodle, a heart, or a tiny masterpiece.</Text>
        </View>
      </LinearGradient>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Drawing board</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Your shared canvas</Text>
        </View>
        <Pressable style={styles.clearButton} onPress={clearBoard}>
          <IconSymbol name="heart" size={15} color={colors.loveAccent} />
          <Text style={[styles.clearButtonText, { color: colors.loveAccent }]}>Clear board</Text>
        </Pressable>
      </View>
      <View style={styles.toolbar}>
        <View style={styles.colorRow}>
          <Text style={[styles.colorLabel, { color: colors.muted }]}>Pick a color</Text>
        {COLORS.map((color) => (
          <Pressable
            key={color}
            accessibilityLabel={`Choose ${color}`}
            onPress={() => setSelectedColor(color)}
            style={[styles.colorButton, { backgroundColor: color }, selectedColor === color && styles.selectedColor]}
          />
        ))}
        </View>
        <Text style={[styles.toolHint, { color: colors.muted }]}>Draw with your finger</Text>
      </View>
      <View style={styles.canvasStage}>
        <View
          style={styles.canvas}
        onLayout={(event) => setCanvasWidth(event.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
        >
        {loading ? (
          <ActivityIndicator color="#7651b8" style={styles.loader} />
        ) : (
          <Svg width={canvasWidth} height="100%" style={StyleSheet.absoluteFill}>
            {strokes.map((stroke, index) => (
              <Path
                key={stroke._id || `local-${index}`}
                d={pointsToPath(stroke.points)}
                stroke={stroke.color}
                strokeWidth={stroke.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {!!currentPoints.length && (
              <Path
                d={pointsToPath(currentPoints)}
                stroke={selectedColor}
                strokeWidth={DEFAULT_STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </Svg>
        )}
        </View>
        <View style={styles.canvasFooter}>
          <View style={[styles.liveDot, { backgroundColor: colors.loveAccent }]} />
          <Text style={[styles.canvasFooterText, { color: colors.muted }]}>Shared live canvas</Text>
          <IconSymbol name="heart" size={14} color={colors.loveAccent} />
        </View>
      </View>
      {!!message && <Text style={styles.error}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 72 },
  hero: { borderRadius: 26, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  heroIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  heroCopy: { flex: 1 },
  heroEyebrow: { color: '#f9d8ea', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  heroTitle: { color: '#fff8fc', fontSize: 22, fontWeight: '800' },
  heroSubtitle: { color: '#f9d8ea', fontSize: 13, marginTop: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 32, fontWeight: '700', color: '#302443' },
  subtitle: { fontSize: 15, marginTop: 5, marginBottom: 16 },
  clearButton: { flexDirection: 'row', alignItems: 'center', gap: 5, borderColor: '#f1b8d4', backgroundColor: '#fff5fa', borderWidth: 1, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 9 },
  clearButtonText: { color: '#62409d', fontWeight: '700' },
  toolbar: { backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, padding: 12, marginBottom: 12 },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  colorLabel: { fontWeight: '800', fontSize: 12, marginRight: 2 },
  colorButton: { width: 28, height: 28, borderRadius: 14 },
  selectedColor: { borderColor: '#fcfaff', borderWidth: 3, shadowColor: '#2e2050', shadowOpacity: 0.35, shadowRadius: 3, elevation: 3 },
  toolHint: { fontSize: 12, marginTop: 9, marginLeft: 2 },
  canvasStage: { backgroundColor: '#eadff8', borderRadius: 24, padding: 7, shadowColor: '#2e2050', shadowOpacity: 0.12, shadowRadius: 12, elevation: 3 },
  canvas: { height: 390, backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 19, overflow: 'hidden' },
  canvasFooter: { height: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  canvasFooterText: { fontSize: 11, fontWeight: '700' },
  loader: { flex: 1 },
  error: { color: '#9b496e', marginTop: 12 },
});
