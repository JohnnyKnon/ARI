/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 커스텀 텍스트 입력 컴포넌트
 * Glassmorphism 스타일 + 포커스 애니메이션
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
import { colors, typography, spacing, borderRadius } from '../../theme/index';

interface AriInputProps extends TextInputProps {
  /** 라벨 텍스트 */
  label: string;
  /** 왼쪽 아이콘 (이모지 또는 텍스트) */
  icon?: string;
  /** 에러 메시지 */
  error?: string;
  /** 비밀번호 토글 표시 여부 */
  isPassword?: boolean;
  /** 컨테이너 스타일 오버라이드 */
  containerStyle?: ViewStyle;
}

const AriInput: React.FC<AriInputProps> = ({
  label,
  icon,
  error,
  isPassword = false,
  containerStyle,
  ...rest
}) => {
  // 포커스 상태 관리
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword);

  // 포커스 애니메이션 값
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // 포커스 시 보더 색상 애니메이션
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.dark.border, colors.primary],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 라벨 */}
      <Text style={[styles.label, isFocused && styles.labelFocused]}>
        {label}
      </Text>

      {/* 입력 필드 컨테이너 (Glassmorphism 효과) */}
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor },
          error ? styles.inputError : null,
        ]}
      >
        {/* 아이콘 */}
        {icon && <Text style={styles.icon}>{icon}</Text>}

        {/* TextInput */}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.gray500}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
          autoCapitalize="none"
          {...rest}
        />

        {/* 비밀번호 토글 */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {isSecure ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* 에러 메시지 */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.medium,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xs + 2,
    marginLeft: spacing.xs,
  },
  labelFocused: {
    color: colors.primaryLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bgTertiary,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputError: {
    borderColor: colors.error,
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.body,
    color: colors.dark.textPrimary,
    height: '100%',
    padding: 0,
  },
  toggleButton: {
    paddingLeft: spacing.sm,
  },
  toggleText: {
    fontSize: 18,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default AriInput;
