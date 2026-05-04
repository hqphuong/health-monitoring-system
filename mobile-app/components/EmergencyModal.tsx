import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, Modal, View, Text, 
  TouchableOpacity, Animated, Easing 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EmergencyModalProps {
  visible: boolean;
  data: any;
  onClose: () => void;
}

export const EmergencyModal = ({ visible, data, onClose }: EmergencyModalProps) => {
  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: false, easing: Easing.linear }),
          Animated.timing(blinkAnim, { toValue: 0, duration: 500, useNativeDriver: false, easing: Easing.linear }),
        ])
      ).start();
    } else {
      blinkAnim.setValue(0);
    }
  }, [visible]);

  const backgroundColor = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 59, 48, 0.9)', 'rgba(255, 59, 48, 1)']
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.sosCard, { backgroundColor }]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="report-problem" size={60} color="white" />
          </View>
          <Text style={styles.sosTitle}>CẢNH BÁO NGUY HIỂM</Text>
          <View style={styles.hrBadge}>
             <Text style={styles.hrText}>{data?.heart_rate || '--'} BPM</Text>
          </View>
          <Text style={styles.sosMessage}>{data?.message || 'Phát hiện nhịp tim bất thường!'}</Text>
          <Text style={styles.sosNote}>Hệ thống đang liên hệ với người thân của bạn...</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>TÔI ĐÃ HIỂU</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  sosCard: {
    width: '100%', borderRadius: 24, padding: 30,
    alignItems: 'center', elevation: 10
  },
  iconContainer: {
    marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15, borderRadius: 50
  },
  sosTitle: { color: 'white', fontSize: 24, fontWeight: '900', marginBottom: 15 },
  hrBadge: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15, marginBottom: 15 },
  hrText: { color: '#FF3B30', fontSize: 32, fontWeight: 'bold' },
  sosMessage: { color: 'white', fontSize: 18, textAlign: 'center', marginBottom: 10, fontWeight: '500' },
  sosNote: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', fontStyle: 'italic', marginBottom: 25 },
  closeButton: { backgroundColor: 'white', width: '100%', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  closeButtonText: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold' }
});