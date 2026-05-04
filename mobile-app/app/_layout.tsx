import React, { useEffect, useState, useRef } from 'react';
import { 
  ActivityIndicator, View, StyleSheet, Modal, 
  Text, TouchableOpacity, Animated, Easing, Alert 
} from 'react-native';
import { Stack } from 'expo-router';
import { initializeAuth } from '../services/api';
import { Colors } from '../constants/Colors';
import { io, Socket } from 'socket.io-client';
import { MaterialIcons } from '@expo/vector-icons';

// --- GLOBAL STATE ---
// Duy nhớ giữ phần này để logic Auth không bị lỗi undefined
let isUserAuthenticated = false;
let authListeners: Array<(value: boolean) => void> = [];

export const getIsAuthenticated = () => isUserAuthenticated;

export const setIsAuthenticated = (value: boolean) => {
  isUserAuthenticated = value;
  authListeners.forEach(listener => listener(value));
};

// Cấu hình Socket (Sử dụng IP LAN máy tính của Duy)
const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL;
const TEST_USER_ID = '1bfbf31a-81ae-4fb5-9222-78e6576d8d5f';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(isUserAuthenticated);
  
  // UI State cho Cảnh báo khẩn cấp
  const [sosVisible, setSosVisible] = useState(false);
  const [sosData, setSosData] = useState<any>(null);
  const blinkAnim = useRef(new Animated.Value(0)).current;

  // Hiệu ứng nhấp nháy nền đỏ khi có SOS
  useEffect(() => {
    if (sosVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: false, easing: Easing.linear }),
          Animated.timing(blinkAnim, { toValue: 0, duration: 500, useNativeDriver: false, easing: Easing.linear }),
        ])
      ).start();
    } else {
      blinkAnim.setValue(0);
    }
  }, [sosVisible]);

  // --- LOGIC SOCKET CHÍNH ---
  useEffect(() => {
    let socket: Socket;

    if (isReady && authenticated) {
      // Khởi tạo kết nối
      socket = io(SOCKET_URL, { 
        transports: ['websocket'], 
        autoConnect: true 
      });

      socket.on('connect', () => {
        console.log('✅ [Socket] Connected. Joining room...');
        // Báo danh với Server để vào phòng riêng
        socket.emit('start_session', { user_id: TEST_USER_ID });
      });

      // 1. Lắng nghe SOS cho chính mình (Bệnh nhân)
      socket.on('emergency_alert', (data) => {
        console.log('🚨 [MY SOS]:', data);
        setSosData(data);
        setSosVisible(true); // Hiện Modal đỏ nhấp nháy
      });

      // 2. Lắng nghe cảnh báo cho Người Thân (Relative Warning)
      socket.on('relative_warning', (data) => {
        console.log('📢 [RELATIVE WARNING]:', data);
        Alert.alert(
          "🚨 CẢNH BÁO NGƯỜI THÂN",
          `${data.patient_name} đang gặp nguy hiểm!\nNhịp tim ghi nhận: ${data.heart_rate} BPM.\nHãy liên lạc ngay lập tức!`,
          [{ text: "GỌI CẤP CỨU", style: "destructive", onPress: () => console.log("Calling...") },
           { text: "ĐÃ HIỂU", style: "cancel" }],
          { cancelable: false }
        );
      });

      socket.on('session_created', (data) => {
        console.log('🏠 [Socket] Room joined successfully');
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [isReady, authenticated]);

  // Logic Khởi tạo Auth (Duy giữ nguyên để App hoạt động bình thường)
  useEffect(() => {
    const listener = (value: boolean) => setAuthenticated(value);
    authListeners.push(listener);

    const bootstrapAuth = async () => {
      try {
        const hasToken = await initializeAuth();
        isUserAuthenticated = hasToken;
        setAuthenticated(hasToken);
      } finally {
        setIsReady(true);
      }
    };

    bootstrapAuth();

    return () => {
      authListeners = authListeners.filter((l: any) => l !== listener);
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  // Nội suy màu nền cho hiệu ứng chớp tắt
  const backgroundColor = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 59, 48, 0.9)', 'rgba(255, 59, 48, 1)']
  });

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />

      {/* MODAL CẢNH BÁO SOS TÙY CHỈNH (UX XỊN) */}
      <Modal visible={sosVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.sosCard, { backgroundColor }]}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="report-problem" size={60} color="white" />
            </View>
            
            <Text style={styles.sosTitle}>CẢNH BÁO NGUY HIỂM</Text>
            
            <View style={styles.hrBadge}>
               <Text style={styles.hrText}>{sosData?.heart_rate || '--'} BPM</Text>
            </View>

            <Text style={styles.sosMessage}>{sosData?.message || 'Phát hiện nhịp tim bất thường!'}</Text>
            
            <Text style={styles.sosNote}>Hệ thống đang liên hệ với người thân của bạn...</Text>

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setSosVisible(false)}
            >
              <Text style={styles.closeButtonText}>TÔI ĐÃ HIỂU</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.neutral.background,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  sosCard: {
    width: '100%', borderRadius: 24, padding: 30,
    alignItems: 'center', elevation: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10
  },
  iconContainer: {
    marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15, borderRadius: 50
  },
  sosTitle: {
    color: 'white', fontSize: 24, fontWeight: '900',
    marginBottom: 15, textAlign: 'center'
  },
  hrBadge: {
    backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 15, marginBottom: 15
  },
  hrText: {
    color: '#FF3B30', fontSize: 32, fontWeight: 'bold'
  },
  sosMessage: {
    color: 'white', fontSize: 18, textAlign: 'center',
    marginBottom: 10, fontWeight: '500', lineHeight: 26
  },
  sosNote: {
    color: 'rgba(255,255,255,0.8)', fontSize: 14,
    textAlign: 'center', fontStyle: 'italic', marginBottom: 25
  },
  closeButton: {
    backgroundColor: 'white', width: '100%', paddingVertical: 15,
    borderRadius: 12, alignItems: 'center'
  },
  closeButtonText: {
    color: '#FF3B30', fontSize: 16, fontWeight: 'bold'
  }
});