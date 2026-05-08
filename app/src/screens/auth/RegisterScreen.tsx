/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 회원가입 화면
 * 실시간 이메일 중복 체크 및 커스텀 가입 불가 팝업 적용
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
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import AriInput from '../../components/ui/Input';
import AriButton from '../../components/ui/Button';
import { colors, typography, spacing } from '../../theme/index';
import { authApi } from '../../services/api';
import type { AuthStackParamList } from '../../navigation/AppNavigator';

type RegisterNav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const CURRENT_TOS_VERSION = '1.0.0';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNav>();
  const { t } = useTranslation();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tosAgreed, setTosAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 실시간 이메일 중복 상태
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // 1. 약관 바텀 시트 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'tos' | 'privacy'>('tos');
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  // 2. 회원가입 성공 커스텀 팝업 상태
  const [successVisible, setSuccessVisible] = useState(false);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.8)).current;

  // 기본 화면 진입 애니메이션
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 30, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // 약관 바텀 시트 애니메이션
  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: SHEET_HEIGHT, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [modalVisible]);

  // 성공 팝업 애니메이션
  useEffect(() => {
    if (successVisible) {
      Animated.parallel([
        Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(successScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    }
  }, [successVisible]);

  // ────── 실시간 이메일 중복 체크 (디바운싱 0.5초) ──────
  useEffect(() => {
    if (!email.trim()) {
      setIsDuplicate(false);
      return;
    }

    // 간단한 이메일 형식 검사 (올바른 형식일 때만 서버 요청)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsDuplicate(false);
      return;
    }

    setIsCheckingEmail(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await authApi.checkEmail(email.trim());
        setIsDuplicate(response.isDuplicate);
      } catch (e) {
        console.log('[Register] Email check failed:', e);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 500); // 0.5초 디바운싱

    return () => clearTimeout(timeoutId);
  }, [email]);

  const getPasswordStrength = (): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: '', color: 'transparent' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: '약함', color: colors.error };
    if (score === 2) return { level: 2, label: '보통', color: colors.warning };
    if (score === 3) return { level: 3, label: '강함', color: colors.success };
    return { level: 4, label: '최고', color: colors.teal };
  };

  const strength = getPasswordStrength();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) newErrors.displayName = '이름을 입력해주세요.';
    if (!email.trim()) newErrors.email = '이메일을 입력해주세요.';
    if (!password) newErrors.password = '비밀번호를 입력해주세요.';
    if (password !== confirmPassword) newErrors.confirmPassword = '비밀번호가 다릅니다.';
    if (!tosAgreed) newErrors.tos = '약관에 동의해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    // [추가] 그래도 가입하기를 누르면 차단
    if (isDuplicate) {
      Alert.alert('가입 불가', '이미 등록된 이메일은 등록할 수 없습니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        tosVersion: CURRENT_TOS_VERSION,
        tosAgreedAt: new Date().toISOString(),
      }) as any;

      if (response.success) {
        setSuccessVisible(true);
      } else {
        Alert.alert('가입 실패', response.error?.message || '다시 시도해주세요.');
      }
    } catch {
      Alert.alert('연결 오류', '서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* ────── 헤더 ────── */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Join A.R.I</Text>
              <Text style={styles.headerSubtitle}>새로운 미래 음악을 창조하세요</Text>
            </View>

            {/* ────── 폼 ────── */}
            <View style={styles.formSection}>
              <AriInput
                placeholder="아티스트명"
                iconName="person-outline"
                value={displayName}
                onChangeText={setDisplayName}
                error={errors.displayName}
              />

              <View>
                <AriInput
                  placeholder="이메일"
                  iconName="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                  keyboardType="email-address"
                />
                {/* 실시간 중복 체크 피드백 */}
                {isCheckingEmail && (
                  <Text style={styles.checkingText}>중복 확인 중...</Text>
                )}
                {isDuplicate && (
                  <Text style={styles.duplicateText}>이미 사용 중인 이메일입니다.</Text>
                )}
                {!isDuplicate && email.includes('@') && email.includes('.') && !isCheckingEmail && (
                  <Text style={styles.availableText}>사용 가능한 이메일입니다.</Text>
                )}
              </View>

              <AriInput
                placeholder="비밀번호"
                iconName="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                isPassword
              />

              {password.length > 0 && (
                <View style={styles.strengthSection}>
                  <View style={styles.strengthBarContainer}>
                    {[1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: level <= strength.level ? strength.color : '#1F1F30' },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                </View>
              )}

              <AriInput
                placeholder="비밀번호 확인"
                iconName="shield-checkmark-outline"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={errors.confirmPassword}
                isPassword
              />

              {/* 실시간 비밀번호 일치 피드백 */}
              {confirmPassword.length > 0 && password === confirmPassword && (
                <Text style={styles.availableText}>비밀번호가 일치합니다.</Text>
              )}
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.duplicateText}>비밀번호가 일치하지 않습니다.</Text>
              )}

              {/* ────── 이용약관 동의 ────── */}

              <TouchableOpacity
                style={styles.tosContainer}
                onPress={() => setTosAgreed(!tosAgreed)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tosAgreed ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={tosAgreed ? colors.teal : colors.gray500}
                  style={styles.tosCheckbox}
                />
                <View style={styles.tosTextContainer}>
                  <View style={styles.tosHeaderRow}>
                    <Text style={styles.tosText}>[필수] 이용약관 및 정책 동의</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                      <Text style={styles.moreText}>더보기</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.tosDetail}>
                    AI 음원의 저작권 책임은 게시자 본인에게 있습니다.
                  </Text>
                </View>
              </TouchableOpacity>

              <AriButton
                title="가입하기"
                onPress={handleRegister}
                loading={loading}
                disabled={!tosAgreed || isDuplicate}
                style={styles.registerButton}
              />
            </View>

            <View style={styles.bottomSection}>
              <Text style={styles.bottomText}>이미 계정이 있으신가요?</Text>
              <AriButton
                title="로그인"
                onPress={() => navigation.navigate('Login')}
                variant="ghost"
                textStyle={{ color: colors.teal }}
              />
            </View>

            <Text style={styles.copyright}>© BZ'NEXA. All rights reserved.</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ────── 1. 고정 오버레이 커스텀 바텀 시트 (60% 높이) ────── */}
      <View style={styles.modalRoot} pointerEvents={modalVisible ? 'auto' : 'none'}>
        <Animated.View style={[styles.modalOverlay, { opacity: backdropOpacity }]} />
        <Animated.View 
          style={[
            styles.modalContent, 
            { height: SHEET_HEIGHT, transform: [{ translateY: sheetTranslateY }] }
          ]}
        >
          <View style={styles.dragHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>약관 및 정책</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, activeTab === 'tos' && styles.activeTab]} onPress={() => setActiveTab('tos')}>
              <Text style={[styles.tabText, activeTab === 'tos' && styles.activeTabText]}>이용약관</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'privacy' && styles.activeTab]} onPress={() => setActiveTab('privacy')}>
              <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>개인정보처리방침</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {activeTab === 'tos' ? (
              <View>
                <Text style={styles.termsTitle}>제 1 조 (목적)</Text>
                <Text style={styles.termsContent}>본 약관은 A.R.I 플랫폼이 제공하는 AI 음악 서비스의 이용조건 및 절차를 규정합니다.</Text>
                <Text style={styles.termsTitle}>제 2 조 (저작권)</Text>
                <Text style={styles.termsContent}>생성된 AI 음원의 권리는 업로더에게 있으며, 타인의 권리 침해 시 책임은 본인에게 귀속됩니다.</Text>
              </View>
            ) : (
              <View>
                <Text style={styles.termsTitle}>1. 수집 항목</Text>
                <Text style={styles.termsContent}>이메일, 비밀번호, 아티스트명 (서비스 제공 및 본인 식별 목적)</Text>
                <Text style={styles.termsTitle}>2. 파기 절차</Text>
                <Text style={styles.termsContent}>목적 달성 후 지체 없이 파기하며, 관계법령에 따른 보존 필요 시 해당 기간 동안 안전하게 보관됩니다.</Text>
              </View>
            )}
            <View style={{ height: 30 }} />
          </ScrollView>

          <AriButton title="확인" onPress={() => setModalVisible(false)} style={styles.modalCloseButton} />
        </Animated.View>
      </View>

      {/* ────── 2. 회원가입 전용 인터랙티브 커스텀 팝업 ────── */}
      {successVisible && (
        <View style={styles.successRoot}>
          <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]} />
          <Animated.View 
            style={[
              styles.successContent, 
              { opacity: successOpacity, transform: [{ scale: successScale }] }
            ]}
          >
            <View style={styles.successIconWrapper}>
              <Ionicons name="checkmark-circle" size={60} color={colors.teal} style={styles.successIcon} />
            </View>
            <Text style={styles.successTitle}>가입 완료!</Text>
            <Text style={styles.successMessage}>
              A.R.I의 아티스트가 되신 것을{'\n'}진심으로 환영합니다.
            </Text>
            <AriButton
              title="로그인하러 가기"
              onPress={() => {
                setSuccessVisible(false);
                navigation.navigate('Login');
              }}
              style={styles.successButton}
            />
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A12' },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: spacing.xxl,
  },
  header: { marginBottom: spacing.xxl },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#13131F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: { fontFamily: typography.fontFamily, fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginBottom: spacing.xs },
  headerSubtitle: { fontFamily: typography.fontFamily, fontSize: typography.sizes.body, color: colors.dark.textSecondary },
  formSection: { marginBottom: spacing.xl },
  strengthSection: { flexDirection: 'row', alignItems: 'center', marginTop: -spacing.sm, marginBottom: spacing.md },
  strengthBarContainer: { flexDirection: 'row', flex: 1, gap: 4 },
  strengthBar: { flex: 1, height: 2, borderRadius: 1 },
  strengthLabel: { fontFamily: typography.fontFamily, fontSize: 11, fontWeight: typography.weights.medium, marginLeft: spacing.sm, width: 40, textAlign: 'right' },
  tosContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.md },
  tosCheckbox: { marginRight: spacing.sm },
  tosTextContainer: { flex: 1 },
  tosHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  tosText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.bodySmall, color: '#FFFFFF', fontWeight: typography.weights.bold },
  moreText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.teal, fontWeight: typography.weights.bold },
  tosDetail: { fontFamily: typography.fontFamily, fontSize: typography.sizes.caption, color: colors.gray500 },
  registerButton: { marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: 4, height: 54 },
  bottomSection: { alignItems: 'center', marginBottom: spacing.md },
  bottomText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.bodySmall, color: colors.gray500 },
  copyright: { fontFamily: typography.fontFamily, fontSize: 10, color: colors.gray500, textAlign: 'center', opacity: 0.3, marginTop: spacing.xl },

  // 실시간 피드백 텍스트
  checkingText: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.gray500, marginTop: -spacing.sm, marginBottom: spacing.md, marginLeft: 4 },
  duplicateText: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.error, marginTop: -spacing.sm, marginBottom: spacing.md, marginLeft: 4 },
  availableText: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.teal, marginTop: -spacing.sm, marginBottom: spacing.md, marginLeft: 4 },

  // 바텀 시트
  modalRoot: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, justifyContent: 'flex-end' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)' },
  modalContent: { backgroundColor: '#0F0F1A', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderTopWidth: 1, borderColor: colors.teal, paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg },
  dragHandle: { width: 36, height: 3, backgroundColor: '#1F1F30', borderRadius: 1.5, alignSelf: 'center', marginBottom: spacing.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontFamily: typography.fontFamily, fontSize: typography.sizes.heading, fontWeight: '900', color: '#FFFFFF' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1F1F30', marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: colors.teal },
  tabText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.bodySmall, color: colors.gray500, fontWeight: typography.weights.bold },
  activeTabText: { color: colors.teal },
  modalBody: { flex: 1 },
  termsTitle: { fontFamily: typography.fontFamily, fontSize: typography.sizes.bodySmall, fontWeight: 'bold', color: '#FFFFFF', marginTop: spacing.md, marginBottom: 4 },
  termsContent: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.dark.textSecondary, lineHeight: 20 },
  modalCloseButton: { marginTop: spacing.md, backgroundColor: colors.teal, borderRadius: 4, height: 50 },

  // 성공 팝업
  successRoot: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, justifyContent: 'center', alignItems: 'center' },
  successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.9)' },
  successContent: { width: '80%', backgroundColor: '#13131F', borderRadius: 16, borderWidth: 1, borderColor: colors.teal, padding: spacing.xl, alignItems: 'center', shadowColor: colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20 },
  successIconWrapper: { marginBottom: spacing.md },
  successIcon: { textShadowColor: colors.teal, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 },
  successTitle: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '900', color: '#FFFFFF', marginBottom: spacing.sm },
  successMessage: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.dark.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  successButton: { width: '100%', backgroundColor: colors.primary, borderRadius: 4, height: 50 },
});

export default RegisterScreen;
