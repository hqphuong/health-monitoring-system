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
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/Colors';
import { api } from '../../services/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email hoặc số điện thoại');
      return false;
    }
    if (!email.includes('@') && !/^\d{10,11}$/.test(email)) {
      setError('Email hoặc số điện thoại không hợp lệ');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      // Gọi API gửi OTP reset password
      const response = await api.forgotPassword({ email: email.trim() });
      
      //console.log('✅ Forgot password response:', response);

      // Chuyển đến màn hình xác thực OTP
      router.push({
        pathname: '/(auth)/otp-verification',
        params: { email, type: 'forgot-password' },
      });
    } catch (err) {
      //console.error('❌ Forgot password error:', err);
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      
      if (message.includes('404') || message.toLowerCase().includes('not found')) {
        setError('Email không tồn tại trong hệ thống');
      } else if (message.includes('429')) {
        setError('Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.neutral.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={48} color={Colors.primary.main} />
            </View>
            <Text style={styles.titleText}>Quên mật khẩu?</Text>
            <Text style={styles.subtitleText}>
              Đừng lo, hãy nhập email hoặc số điện thoại đã đăng ký.{'\n'}
              Chúng tôi sẽ gửi mã xác thực để đặt lại mật khẩu.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email hoặc Số điện thoại"
              placeholder="example@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              error={error}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              title="Gửi mã xác thực"
              onPress={handleSubmit}
              loading={loading}
              size="lg"
            />
          </View>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => router.push('/(auth)/login')}
          >
            <Ionicons name="arrow-back" size={16} color={Colors.primary.main} />
            <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.status.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
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
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginTop: Spacing.lg,
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  backToLoginText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeights.medium,
  },
});
