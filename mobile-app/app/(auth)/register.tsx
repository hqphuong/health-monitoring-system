import React, { useState, useEffect } from 'react';
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
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Button, Input, Logo } from '../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/Colors';
import { api, setAuthToken } from '../../services/api';
import { loginSuccess } from '../../services/auth';
import { API_CONFIG, ENDPOINTS } from '@/config/api';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string; confirmPassword?: string;}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '108716607237-uhfctsgtmllj82dbc003okchlhk9tqhn.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email hoặc số điện thoại';
    } else if (!email.includes('@') && !/^\d{10,11}$/.test(email)) {
      newErrors.email = 'Email hoặc số điện thoại không hợp lệ';
    }
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // LUỒNG 1: Đăng ký thường -> Vẫn giữ nguyên đường dẫn tới OTP của bạn
  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await api.register({
        email: email.trim(),
        password: password,
        confirm_password: confirmPassword,
        full_name: "Người dùng mới",
      });
      
      // Giữ nguyên logic cũ của bạn
      router.push({
        pathname: '/(auth)/otp-verification',
        params: { email, type: 'register' },
      });
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  // LUỒNG 2: Đăng ký bằng Google -> Nhảy thẳng tới trang cập nhật thông tin
  // Hàm xử lý đăng ký/đăng nhập nhanh bằng Google
  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      // Luôn hiện bảng chọn tài khoản
      try { await GoogleSignin.signOut(); } catch (e) {}
      
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH_GOOGLE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      // Lưu session
      await loginSuccess(result.data.access_token, {
        user_id: String(result.data.user.user_id),
        email: String(result.data.user.email),
      });

      setAuthToken(result.data.access_token);
      
      // ✅ ĐƯỜNG DẪN ĐÚNG THEO ẢNH CỦA DUY:
      console.log('✅ Điều hướng tới trang user-info');
      router.replace('/(auth)/user-info' as any); 
      
    } catch (error: any) {
      if (error.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Lỗi', 'Đăng ký Google thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.neutral.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Logo size="md" />
            <Text style={styles.titleText}>Tạo tài khoản</Text>
            <Text style={styles.subtitleText}>Đăng ký để bắt đầu theo dõi sức khỏe</Text>
          </View>

          <View style={styles.form}>
            <Input label="Email" placeholder="example@email.com" value={email} onChangeText={setEmail} error={errors.email} />
            <Input label="Mật khẩu" placeholder="Tối thiểu 6 ký tự" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry />
            <Input label="Nhập lại mật khẩu" placeholder="Xác nhận mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} secureTextEntry />

            <Button title="Đăng ký" onPress={handleRegister} loading={loading} size="lg" />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Tiếp tục với Google"
              variant="outline"
              onPress={handleGoogleRegister}
              size="lg"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Đã có tài khoản? <Link href="/(auth)/login" asChild><Text style={styles.linkText}>Đăng nhập</Text></Link>
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