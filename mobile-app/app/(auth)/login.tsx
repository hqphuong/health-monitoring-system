import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

import { Button, Input, Logo } from '../../components';
import { loginSuccess } from '../../services/auth';
import { setAuthToken } from '../../services/api';
import { API_CONFIG, ENDPOINTS } from '../../config/api';
import { setIsAuthenticated } from '../_layout';

// Hoàn tất phiên đăng nhập nếu chạy trên trình duyệt web/định danh mobile
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  // --- Cấu hình Google Auth chuẩn Native ---
  const [request, response, promptAsync] = Google.useAuthRequest({
    // Android Client ID từ Google Console
    androidClientId: "110592685127-25bi62m7n421o5uolp29mm288g50vvc1.apps.googleusercontent.com",
    // Web Client ID từ Google Console (Bắt buộc phải có để backend verify)
    webClientId: "110592685127-dmf46tquo98seng5sva57ufgelp9gvgr.apps.googleusercontent.com",
    
    // Ép buộc dùng Redirect URI chuẩn của Android để fix lỗi "Custom URI scheme"
    redirectUri: AuthSession.makeRedirectUri({
      native: 'com.namhu147.mobileapp:/oauth2redirect',
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    } else if (response?.type === 'error') {
      Alert.alert("Lỗi", "Không thể kết nối với Google.");
    }
  }, [response]);

  // --- Xử lý Đăng nhập Google qua Backend ---
  const handleGoogleLogin = async (idToken: string | undefined) => {
    if (!idToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await res.json();

      if (data.status === "success") {
        const { access_token, user } = data.data;
        await loginSuccess(access_token, user);
        setAuthToken(access_token);
        setIsAuthenticated(true);
        router.replace('/(tabs)');
      } else {
        Alert.alert("Lỗi", data.message || "Xác thực Google thất bại");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  // --- Xử lý Đăng nhập Email truyền thống ---
  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH_LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ email: data.message || 'Đăng nhập thất bại' });
        return;
      }

      // Giả sử server trả về { data: { access_token, user } }
      const token = data.data?.access_token || data.token;
      const user = data.data?.user || data.user;

      if (!token) {
        setErrors({ email: 'Phản hồi từ server thiếu token' });
        return;
      }

      await loginSuccess(token, user);
      setAuthToken(token);
      setIsAuthenticated(true);
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({ email: 'Không thể kết nối server. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email hoặc số điện thoại';
    }
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            {/*<Logo size={80} />*/}
            <Text style={styles.title}>Chào mừng quay lại</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục theo dõi sức khỏe của bạn</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email hoặc số điện thoại"
              placeholder="Nhập email của bạn"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Hoặc đăng nhập với</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={() => promptAsync()}
              disabled={!request || loading}
            >
              <Text style={styles.googleButtonText}>Đăng nhập bằng Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerText}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#666666', textAlign: 'center', marginTop: 8 },
  form: { width: '100%' },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: '#007AFF', fontSize: 14, fontWeight: '500' },
  loginButton: { marginBottom: 24 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  divider: { flex: 1, height: 1, backgroundColor: '#EEEEEE' },
  dividerText: { marginHorizontal: 16, color: '#999999', fontSize: 12 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: { fontSize: 16, fontWeight: '500', color: '#444444' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#666666', fontSize: 14 },
  registerText: { color: '#007AFF', fontSize: 14, fontWeight: 'bold' },
});