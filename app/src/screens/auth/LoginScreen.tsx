/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 로그인 화면
 * 프리미엄 다크 모드 UI + 애니메이션
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AriInput from '../../components/ui/Input';
import AriButton from '../../components/ui/Button';
import { colors, typography, spacing, borderRadius } from '../../theme/index';
import { authApi, setAccessToken } from '../../services/api';
import type { AuthStackParamList } from '../../navigation/AppNavigator';

type LoginNav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNav>();

  // 폼 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // 등장 애니메이션
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const bottomAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 순차 등장 애니메이션 (로고 → 폼 → 하단)
    Animated.stagger(150, [
      Animated.spring(logoAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(formAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(bottomAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoAnim, formAnim, bottomAnim]);

  // 유효성 검증
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 로그인 처리
  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authApi.login({ email: email.trim(), password }) as {
        success: boolean;
        data?: { accessToken: string };
        error?: { message: string };
      };

      if (response.success && response.data?.accessToken) {
        setAccessToken(response.data.accessToken);
        // TODO: 메인 화면으로 전환 (Zustand store 업데이트)
        Alert.alert('🎵 환영합니다!', 'ARI에 로그인되었습니다.');
      } else {
        Alert.alert('로그인 실패', response.error?.message || '다시 시도해주세요.');
      }
    } catch (err) {
      Alert.alert('연결 오류', '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ────── 로고 / 브랜딩 영역 ────── */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: logoAnim,
              transform: [
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* 브랜드 글로우 효과 */}
          <View style={styles.glowContainer}>
            <View style={styles.glowOuter} />
            <View style={styles.glowInner} />
          </View>

          {/* 로고 텍스트 */}
          <Text style={styles.logoEmoji}>🎵</Text>
          <Text style={styles.logoText}>ARI</Text>
          <Text style={styles.logoSubtitle}>Artificial Rhythm Intelligence</Text>
          <Text style={styles.slogan}>AI가 만드는 가장 한국적인 선율</Text>
        </Animated.View>

        {/* ────── 로그인 폼 ────── */}
        <Animated.View
          style={[
            styles.formSection,
            {
              opacity: formAnim,
              transform: [
                {
                  translateY: formAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* 이메일 입력 */}
          <AriInput
            label="이메일"
            icon="📧"
            placeholder="artist@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
          />

          {/* 비밀번호 입력 */}
          <AriInput
            label="비밀번호"
            icon="🔒"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            isPassword
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {/* 로그인 버튼 */}
          <AriButton
            title="로그인"
            onPress={handleLogin}
            loading={loading}
            disabled={!email.trim() || !password}
            style={styles.loginButton}
          />

          {/* 비밀번호 찾기 */}
          <AriButton
            title="비밀번호를 잊으셨나요?"
            onPress={() => {
              // TODO: 비밀번호 재설정 화면
              Alert.alert('준비 중', '비밀번호 재설정 기능은 곧 제공됩니다.');
            }}
            variant="ghost"
            style={styles.forgotButton}
          />
        </Animated.View>

        {/* ────── 구분선 ────── */}
        <Animated.View style={[styles.dividerSection, { opacity: bottomAnim }]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        {/* ────── 소셜 로그인 (추후 활성화) ────── */}
        <Animated.View
          style={[
            styles.socialSection,
            {
              opacity: bottomAnim,
              transform: [
                {
                  translateY: bottomAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.socialRow}>
            <AriButton
              title="카카오"
              icon="💬"
              onPress={() => Alert.alert('준비 중', '카카오 로그인은 곧 제공됩니다.')}
              variant="social"
              disabled
            />
            <AriButton
              title="구글"
              icon="🔍"
              onPress={() => Alert.alert('준비 중', '구글 로그인은 곧 제공됩니다.')}
              variant="social"
              disabled
            />
            <AriButton
              title="Apple"
              icon="🍎"
              onPress={() => Alert.alert('준비 중', 'Apple 로그인은 곧 제공됩니다.')}
              variant="social"
              disabled
            />
          </View>
          <Text style={styles.socialHint}>소셜 로그인은 곧 지원됩니다</Text>
        </Animated.View>

        {/* ────── 회원가입 링크 ────── */}
        <Animated.View style={[styles.bottomSection, { opacity: bottomAnim }]}>
          <Text style={styles.bottomText}>아직 계정이 없으신가요?</Text>
          <AriButton
            title="회원가입"
            onPress={() => navigation.navigate('Register')}
            variant="ghost"
            textStyle={styles.registerLink}
          />
        </Animated.View>

        {/* 저작권 표시 */}
        <Text style={styles.copyright}>© BZ'NEXA. All rights reserved.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.dark.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: spacing.xxl,
  },

  // ── 로고 영역 ──
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  glowContainer: {
    position: 'absolute',
    top: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    opacity: 0.06,
    position: 'absolute',
  },
  glowInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  logoText: {
    fontFamily: typography.fontFamily,
    fontSize: 42,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 8,
  },
  logoSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.regular,
    color: colors.gray500,
    marginTop: spacing.xs,
    letterSpacing: 2,
  },
  slogan: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.bodySmall,
    color: colors.dark.textSecondary,
    marginTop: spacing.md,
  },

  // ── 폼 영역 ──
  formSection: {
    marginBottom: spacing.lg,
  },
  loginButton: {
    marginTop: spacing.sm,
    height: 54,
  },
  forgotButton: {
    marginTop: spacing.xs,
    height: 40,
  },

  // ── 구분선 ──
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.dark.border,
  },
  dividerText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.caption,
    color: colors.gray500,
    marginHorizontal: spacing.md,
  },

  // ── 소셜 로그인 ──
  socialSection: {
    marginBottom: spacing.xl,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialHint: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.caption,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // ── 하단 ──
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  bottomText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.bodySmall,
    color: colors.gray500,
  },
  registerLink: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.semibold,
  },

  // ── 저작권 ──
  copyright: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.gray500,
    textAlign: 'center',
    opacity: 0.5,
  },
});

export { LoginScreen as LoginPlaceholder };
export default LoginScreen;
