import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { api, setAuthToken } from '../../services/api';
import { loginSuccess } from '@/services/auth';

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

export default function OTPVerificationScreen() {
  const { email, type } = useLocalSearchParams<{ email: string; type: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];

    // Handle paste
    if (value.length > 1) {
      const pastedCode = value.slice(0, OTP_LENGTH).split('');
      pastedCode.forEach((digit, i) => {
        if (i < OTP_LENGTH) newOtp[i] = digit;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedCode.length, OTP_LENGTH - 1)]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
  const otpCode = otp.join('');
  if (otpCode.length !== OTP_LENGTH) {
    setError('Vui lòng nhập đầy đủ mã xác thực');
    return;
  }

  setLoading(true);
  try {
    if (type === 'register') {
      // 1. Gọi API Verify vừa tạo ở Backend
      const response = await api.verifyRegisterOTP({ 
        email: email || '', 
        otp: otpCode 
      });

      // 2. Nếu có token trả về, lưu ngay vào máy
      if (response.token) {
        await loginSuccess(response.token, response.user); // Lưu SecureStore
        setAuthToken(response.token); // Lưu vào biến cachedToken trong api.ts
        
        //console.log('✅ Xác thực thành công & Đã có Token');
        
        // 3. Chuyển sang màn hình nhập thông tin (Lúc này updateProfile sẽ chạy OK)
        router.push('/(auth)/user-info');
      }
    } else if (type === 'forgot-password') {
      // ... giữ nguyên logic reset password ...
    }
  } catch (err) {
    //console.error('❌ Lỗi xác thực:', err);
    setError('Mã OTP không đúng hoặc đã hết hạn.');
  } finally {
    setLoading(false);
  }
};

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(RESEND_COUNTDOWN);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');

    try {
      // Gọi lại API forgot-password để gửi OTP mới
      if (type === 'forgot-password') {
        await api.forgotPassword({ email: email || '' });
      }
      // Với register, cần gọi lại API register (hoặc API resend-otp nếu BE có)
      
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến email của bạn.');
    } catch (err) {
      //console.error('❌ Resend OTP error:', err);
      Alert.alert('Lỗi', 'Không thể gửi lại mã. Vui lòng thử lại sau.');
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{3})(.*)(@.*)/, '$1***$3')
    : 'email của bạn';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral.background} />

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
          <Ionicons name="mail-open-outline" size={48} color={Colors.primary.main} />
        </View>
        <Text style={styles.titleText}>Xác thực OTP</Text>
        <Text style={styles.subtitleText}>
          Chúng tôi đã gửi mã xác thực 6 số đến{'\n'}
          <Text style={styles.emailText}>{maskedEmail}</Text>
        </Text>
      </View>

      {/* OTP Input */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            style={[
              styles.otpInput,
              digit && styles.otpInputFilled,
              error && styles.otpInputError,
            ]}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            selectTextOnFocus
            autoFocus={index === 0}
          />
        ))}
      </View>

      {/* New Password Input (for forgot-password flow) */}
      {showPasswordInput && type === 'forgot-password' && (
        <View style={styles.passwordContainer}>
          <Text style={styles.passwordLabel}>Nhập mật khẩu mới</Text>
          <TextInput
            style={styles.passwordInput}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
            placeholderTextColor={Colors.neutral.placeholder}
            secureTextEntry
            autoFocus
          />
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={Colors.status.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Verify Button */}
      <Button
        title={showPasswordInput ? "Đặt lại mật khẩu" : (type === 'forgot-password' ? "Tiếp tục" : "Xác nhận")}
        onPress={handleVerify}
        loading={loading}
        size="lg"
        disabled={otp.join('').length !== OTP_LENGTH || (showPasswordInput && newPassword.length < 6)}
        style={styles.verifyButton}
      />

      {/* Resend */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Không nhận được mã? </Text>
        {canResend ? (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Gửi lại</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.countdownText}>
            Gửi lại sau {countdown}s
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
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
    backgroundColor: Colors.status.infoLight,
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
  emailText: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeights.semibold,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    backgroundColor: Colors.neutral.white,
    textAlign: 'center',
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
    ...Shadows.sm,
  },
  otpInputFilled: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.status.infoLight,
  },
  otpInputError: {
    borderColor: Colors.status.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.status.error,
  },
  verifyButton: {
    marginTop: Spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  resendText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
  },
  resendLink: {
    fontSize: Typography.fontSizes.base,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeights.semibold,
  },
  countdownText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.placeholder,
  },
  passwordContainer: {
    marginBottom: Spacing.lg,
  },
  passwordLabel: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.sm,
  },
  passwordInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textPrimary,
    backgroundColor: Colors.neutral.white,
  },
});
