import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { api } from '../../services/api';
import { setIsAuthenticated } from '../_layout'; // Import hàm cập nhật Auth

type Gender = 'male' | 'female' | 'other' | null;

export default function UserInfoScreen() {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>(null);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!birthDate) {
      newErrors.birthDate = 'Vui lòng nhập ngày sinh';
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
      newErrors.birthDate = 'Định dạng: DD/MM/YYYY';
    }

    if (!gender) {
      newErrors.gender = 'Vui lòng chọn giới tính';
    }

    if (!height) {
      newErrors.height = 'Vui lòng nhập chiều cao';
    } else if (isNaN(Number(height)) || Number(height) < 50 || Number(height) > 250) {
      newErrors.height = 'Chiều cao không hợp lệ (50-250 cm)';
    }

    if (!weight) {
      newErrors.weight = 'Vui lòng nhập cân nặng';
    } else if (isNaN(Number(weight)) || Number(weight) < 20 || Number(weight) > 300) {
      newErrors.weight = 'Cân nặng không hợp lệ (20-300 kg)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Parse birthDate từ DD/MM/YYYY sang ISO format (YYYY-MM-DD)
      let formattedBirth = null;
      if (birthDate) {
        const parts = birthDate.split('/');
        if (parts.length === 3) {
          formattedBirth = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      // Cập nhật Profile lên Backend
      await api.updateProfile({
        full_name: fullName.trim(),
        birth: formattedBirth, // Sử dụng 'birth' theo Schema Prisma
        gender: gender || undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
      });

      //console.log('✅ User info saved successfully');
      
      // QUAN TRỌNG: Cập nhật trạng thái Auth toàn cục trước khi chuyển màn hình
      setIsAuthenticated(true);
      
      // Chuyển hướng thay thế hoàn toàn để không quay lại được màn Auth
      router.replace('/(tabs)');
      
    } catch (error) {
      //console.error('❌ Error saving user info:', error);
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      
      if (message.includes('PROFILE_INCOMPLETE')) {
         Alert.alert('Thông báo', 'Hệ thống cần đầy đủ Chiều cao, Cân nặng và Ngày sinh để hoạt động.');
      } else {
         Alert.alert('Lỗi', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatBirthDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    setBirthDate(formatted);
  };

  const genderOptions: { value: Gender; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'male', label: 'Nam', icon: 'male' },
    { value: 'female', label: 'Nữ', icon: 'female' },
    { value: 'other', label: 'Khác', icon: 'person' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={styles.progressText}>Bước cuối cùng</Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.titleText}>Thông tin cá nhân</Text>
            <Text style={styles.subtitleText}>
              Giúp chúng tôi hiểu bạn hơn để theo dõi sức khỏe chính xác
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              leftIcon="person-outline"
              required
            />

            <Input
              label="Ngày sinh"
              placeholder="DD/MM/YYYY"
              value={birthDate}
              onChangeText={formatBirthDate}
              error={errors.birthDate}
              leftIcon="calendar-outline"
              keyboardType="number-pad"
              maxLength={10}
              required
            />

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Giới tính <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.genderContainer}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOption,
                      gender === option.value && styles.genderOptionSelected,
                    ]}
                    onPress={() => setGender(option.value)}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={gender === option.value ? Colors.primary.main : Colors.neutral.placeholder}
                    />
                    <Text
                      style={[
                        styles.genderText,
                        gender === option.value && styles.genderTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color={Colors.status.error} />
                  <Text style={styles.errorText}>{errors.gender}</Text>
                </View>
              )}
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Input
                  label="Chiều cao (cm)"
                  placeholder="170"
                  value={height}
                  onChangeText={setHeight}
                  error={errors.height}
                  keyboardType="number-pad"
                  required
                />
              </View>
              <View style={styles.halfField}>
                <Input
                  label="Cân nặng (kg)"
                  placeholder="65"
                  value={weight}
                  onChangeText={setWeight}
                  error={errors.weight}
                  keyboardType="number-pad"
                  required
                />
              </View>
            </View>

            {height && weight && !isNaN(Number(height)) && !isNaN(Number(weight)) && (
              <View style={styles.bmiContainer}>
                <Text style={styles.bmiLabel}>Chỉ số BMI của bạn:</Text>
                <Text style={styles.bmiValue}>
                  {(Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1)}
                </Text>
              </View>
            )}

            <View style={styles.spacer} />

            <Button
              title="Hoàn tất đăng ký"
              onPress={handleSubmit}
              loading={loading}
              size="lg"
            />

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                setIsAuthenticated(true);
                router.replace('/(tabs)');
              }}
            >
              <Text style={styles.skipText}>Bỏ qua, thiết lập sau</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.neutral.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.main,
  },
  progressText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeights.medium,
    marginTop: Spacing.sm,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  titleText: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitleText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.status.error,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    backgroundColor: Colors.neutral.white,
    ...Shadows.sm,
  },
  genderOptionSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.status.infoLight,
  },
  genderText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  genderTextSelected: {
    color: Colors.primary.main,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.status.error,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.status.infoLight,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  bmiLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary.main,
  },
  bmiValue: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary.main,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.lg,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  skipText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
  },
});
