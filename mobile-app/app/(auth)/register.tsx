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
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Logo } from '../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/Colors';
import { api } from '../../services/api';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Validate email/phone
    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email hoặc số điện thoại';
    } else if (!email.includes('@') && !/^\d{10,11}$/.test(email)) {
      newErrors.email = 'Email hoặc số điện thoại không hợp lệ';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 1 chữ in hoa';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 1 số';
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Gọi API đăng ký
      const response = await api.register({
        email: email.trim(),
        password: password,
        confirm_password: confirmPassword,
        full_name: "Người dùng mới",
      });

      console.log('✅ Register response:', response);

      // Chuyển đến màn hình xác thực OTP
      router.push({
        pathname: '/(auth)/otp-verification',
        params: { email, type: 'register' },
      });
    } catch (error) {
      console.error('❌ Register error:', error);
      const message = error instanceof Error ? error.message : 'Đăng ký thất bại';

      // Xử lý các lỗi cụ thể từ API
      if (message.includes('409') || message.toLowerCase().includes('exist')) {
        Alert.alert('Lỗi', 'Email này đã được đăng ký. Vui lòng sử dụng email khác.');
      } else if (message.includes('400')) {
        Alert.alert('Lỗi', 'Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.');
      } else {
        Alert.alert('Lỗi', message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '', color: Colors.neutral.disabled };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: strength, text: 'Yếu', color: Colors.status.error };
    if (strength <= 3) return { level: strength, text: 'Trung bình', color: Colors.status.warning };
    return { level: strength, text: 'Mạnh', color: Colors.status.success };
  };

  const passwordStrength = getPasswordStrength();

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
            <Logo size="md" />
            <Text style={styles.titleText}>Tạo tài khoản</Text>
            <Text style={styles.subtitleText}>
              Đăng ký để bắt đầu theo dõi sức khỏe
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email hoặc Số điện thoại"
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
            />

            <Input
              label="Mật khẩu"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              leftIcon="lock-closed-outline"
              secureTextEntry
              required
            />

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : Colors.neutral.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
              </View>
            )}

            <Input
              label="Nhập lại mật khẩu"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              leftIcon="lock-closed-outline"
              secureTextEntry
              required
            />

            {/* Terms */}
            <Text style={styles.termsText}>
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <Text style={styles.linkText}>Điều khoản sử dụng</Text> và{' '}
              <Text style={styles.linkText}>Chính sách bảo mật</Text> của chúng tôi.
            </Text>

            <Button
              title="Đăng ký"
              onPress={handleRegister}
              loading={loading}
              size="lg"
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Register */}
            <Button
              title="Tiếp tục với Google"
              variant="outline"
              onPress={() => { }}
              size="lg"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Đã có tài khoản?{' '}
              <Link href="/(auth)/login" asChild>
                <Text style={styles.linkText}>Đăng nhập</Text>
              </Link>
            </Text>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  titleText: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
    marginTop: Spacing.lg,
  },
  subtitleText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
    minWidth: 60,
    textAlign: 'right',
  },
  termsText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: Colors.neutral.textSecondary,
    fontSize: Typography.fontSizes.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
  },
  linkText: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeights.semibold,
  },
});
