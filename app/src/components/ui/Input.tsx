/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 커스텀 텍스트 입력 컴포넌트
 * Cyber-Minimalism (Apple Music Style) - 라벨 없음, 플레이스홀더 중심
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, borderRadius } from '../../theme/index';

interface AriInputProps extends TextInputProps {
  /** 아이콘 이름 (Ionicons) */
  iconName?: string;
  /** 에러 메시지 */
  error?: string;
  /** 비밀번호 토글 표시 여부 */
  isPassword?: boolean;
  /** 컨테이너 스타일 오버라이드 */
  containerStyle?: ViewStyle;
}

const AriInput: React.FC<AriInputProps> = ({
  iconName,
  error,
  isPassword = false,
  containerStyle,
  placeholder,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword);

  // 포커스 애니메이션 (언더라인 글로우 효과)
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // 포커스 시 언더라인 색상 및 글로우 전환
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#252538', colors.teal], // 기본 어두운 선 -> 민트색 네온
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 입력 필드 컨테이너 (애플뮤직 스타일의 미니멀한 박스) */}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color={isFocused ? colors.teal : colors.gray500}
            style={styles.icon}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.gray500}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
          autoCapitalize="none"
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.toggleButton}
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.gray500}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 미래지향적 언더라인 글로우 효과 */}
      <Animated.View style={[styles.underline, { backgroundColor: borderColor }]} />

      {/* 에러 메시지 */}
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131F', // 극도로 어두운 배경 (애플뮤직 스타일)
    paddingHorizontal: spacing.md,
    height: 56,
    borderRadius: 4, // 각진 느낌을 살린 미니멀 라운딩
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.body,
    color: '#F9FAFB', // 부드러운 오프화이트로 가독성 확보
    height: '100%',
    padding: 0,
  },
  toggleButton: {
    paddingLeft: spacing.sm,
  },
  underline: {
    height: 1,
    marginTop: 2,
    borderRadius: 1,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginLeft: 2,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.caption,
    color: colors.error,
    marginLeft: spacing.xs,
  },
});

export default AriInput;
