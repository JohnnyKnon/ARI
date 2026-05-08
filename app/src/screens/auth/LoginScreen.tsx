/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 로그인 화면
 * Cyber-Minimalism 스타일 - 언어 설정 영구 저장(AsyncStorage) 적용
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
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AriInput from '../../components/ui/Input';
import AriButton from '../../components/ui/Button';
import { colors, typography, spacing } from '../../theme/index';
import { authApi, setAccessToken } from '../../services/api';
import type { AuthStackParamList } from '../../navigation/AppNavigator';

type LoginNav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNav>();
  const { t, i18n } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [langMenuVisible, setLangMenuVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = t('login.email_placeholder') + '를 입력해주세요.';
    if (!password) newErrors.password = t('login.password_placeholder') + '를 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await authApi.login({ email: email.trim(), password }) as any;
      if (response.success && response.data?.accessToken) {
        setAccessToken(response.data.accessToken);
      } else {
        Alert.alert(t('login.login_failed'), response.error?.message || '실패');
      }
    } catch {
      Alert.alert(t('login.connect_error'), '서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 언어 변경 및 AsyncStorage 저장
  const changeLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem('user-language', lang);
    } catch (e) {
      console.log('[LoginScreen] Failed to save language:', e);
    }
    setLangMenuVisible(false);
  };

  const getCurrentLangLabel = () => {
    switch (i18n.language) {
      case 'ko': return 'KO';
      case 'en': return 'EN';
      case 'ja': return 'JP';
      default: return 'EN';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.bgGlowPurple} />
      <View style={styles.bgGlowTeal} />

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.langButton}
          onPress={() => setLangMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="globe-outline" size={16} color={colors.teal} />
          <Text style={styles.langButtonText}>{getCurrentLangLabel()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.logoSection}>
            <Text style={styles.logoText}>{t('login.title')}</Text>
            <Text style={styles.logoSubtitle}>{t('login.subtitle')}</Text>
          </View>

          <View style={styles.sloganSection}>
            <Text style={styles.sloganText}>{t('login.slogan')}</Text>
          </View>

          <View style={styles.formSection}>
            <AriInput
              placeholder={t('login.email_placeholder')}
              iconName="mail-outline"
              value={email}
              onChangeText={(text) => setEmail(text)}
              error={errors.email}
              keyboardType="email-address"
            />

            <AriInput
              placeholder={t('login.password_placeholder')}
              iconName="lock-closed-outline"
              value={password}
              onChangeText={(text) => setPassword(text)}
              error={errors.password}
              isPassword
              onSubmitEditing={handleLogin}
            />

            <AriButton
              title={t('login.login_btn')}
              onPress={handleLogin}
              loading={loading}
              disabled={!email.trim() || !password}
              style={styles.loginButton}
            />

            <AriButton
              title={t('login.forgot_password')}
              onPress={() => Alert.alert('Notice', 'Coming soon')}
              variant="ghost"
              style={styles.forgotButton}
            />
          </View>

          <View style={styles.dividerSection}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('login.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialSection}>
            <AriButton title="Kakao" onPress={() => {}} variant="social" style={styles.socialBtn} />
            <AriButton title="Google" onPress={() => {}} variant="social" style={styles.socialBtn} />
            <AriButton title="Apple" onPress={() => {}} variant="social" style={styles.socialBtn} />
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.bottomText}>{t('login.no_account')}</Text>
            <AriButton
              title={t('login.register_link')}
              onPress={() => navigation.navigate('Register')}
              variant="ghost"
              textStyle={{ color: colors.teal }}
            />
          </View>

          <Text style={styles.copyright}>© BZ'NEXA. All rights reserved.</Text>
        </Animated.View>
      </ScrollView>

      {langMenuVisible && (
        <View style={styles.actionSheetOverlay}>
          <TouchableOpacity
            style={styles.actionSheetBackdrop}
            onPress={() => setLangMenuVisible(false)}
          />
          <View style={styles.actionSheetContent}>
            <Text style={styles.actionSheetTitle}>{t('common.language')}</Text>
            
            <TouchableOpacity style={styles.langItem} onPress={() => changeLanguage('ko')}>
              <Text style={[styles.langItemText, i18n.language === 'ko' && styles.langItemActive]}>한국어 (KO)</Text>
              {i18n.language === 'ko' && <Ionicons name="checkmark" size={20} color={colors.teal} />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.langItem} onPress={() => changeLanguage('en')}>
              <Text style={[styles.langItemText, i18n.language === 'en' && styles.langItemActive]}>English (EN)</Text>
              {i18n.language === 'en' && <Ionicons name="checkmark" size={20} color={colors.teal} />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.langItem} onPress={() => changeLanguage('ja')}>
              <Text style={[styles.langItemText, i18n.language === 'ja' && styles.langItemActive]}>日本語 (JP)</Text>
              {i18n.language === 'ja' && <Ionicons name="checkmark" size={20} color={colors.teal} />}
            </TouchableOpacity>

            <AriButton
              title={t('common.close')}
              onPress={() => setLangMenuVisible(false)}
              style={styles.actionSheetCloseBtn}
            />
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A12',
  },
  bgGlowPurple: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary,
    opacity: 0.15,
  },
  bgGlowTeal: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.teal,
    opacity: 0.1,
  },
  headerRight: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: spacing.xl,
    zIndex: 10,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131F',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252538',
  },
  langButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
    paddingBottom: spacing.xxl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontFamily: typography.fontFamily,
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  logoSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.gray500,
    letterSpacing: 2,
  },
  sloganSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  sloganText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.body,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  loginButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: 54,
  },
  forgotButton: {
    marginTop: spacing.sm,
  },
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1F1F30',
  },
  dividerText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.gray500,
    marginHorizontal: spacing.md,
  },
  socialSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  socialBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#13131F',
    borderRadius: 4,
    height: 48,
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bottomText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.bodySmall,
    color: colors.gray500,
  },
  copyright: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.gray500,
    textAlign: 'center',
    opacity: 0.3,
    marginTop: spacing.xl,
  },
  actionSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  actionSheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  actionSheetContent: {
    backgroundColor: '#0F0F1A',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderColor: colors.teal,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
  },
  actionSheetTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.heading,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F30',
  },
  langItemText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.body,
    color: colors.dark.textSecondary,
  },
  langItemActive: {
    color: colors.teal,
    fontWeight: 'bold',
  },
  actionSheetCloseBtn: {
    marginTop: spacing.lg,
    backgroundColor: '#13131F',
    height: 50,
  },
});

export default LoginScreen;
