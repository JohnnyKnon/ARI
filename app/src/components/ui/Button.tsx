/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 커스텀 버튼 컴포넌트
 * Primary/Secondary/Ghost 변형 지원
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/index';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'social';

interface AriButtonProps {
  /** 버튼 텍스트 */
  title: string;
  /** 클릭 핸들러 */
  onPress: () => void;
  /** 버튼 스타일 변형 */
  variant?: ButtonVariant;
  /** 로딩 상태 */
  loading?: boolean;
  /** 비활성 상태 */
  disabled?: boolean;
  /** 왼쪽 아이콘 (이모지) */
  icon?: string;
  /** 컨테이너 스타일 */
  style?: ViewStyle;
  /** 텍스트 스타일 */
  textStyle?: TextStyle;
}

const AriButton: React.FC<AriButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        variantStyles[variant].container,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.primary}
        />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text
            style={[
              styles.text,
              variantStyles[variant].text,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  text: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.button,
    fontWeight: typography.weights.semibold,
  },
});

// 변형별 스타일 맵
const variantStyles = {
  primary: StyleSheet.create({
    container: {
      backgroundColor: colors.primary,
      ...shadows.md,
      shadowColor: colors.primary,
    },
    text: {
      color: colors.white,
    },
  }),
  secondary: StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    text: {
      color: colors.primary,
    },
  }),
  ghost: StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
    },
    text: {
      color: colors.primaryLight,
    },
  }),
  social: StyleSheet.create({
    container: {
      backgroundColor: colors.dark.bgTertiary,
      borderWidth: 1,
      borderColor: colors.dark.border,
      flex: 1,
      marginHorizontal: spacing.xs,
    },
    text: {
      color: colors.dark.textPrimary,
      fontSize: typography.sizes.bodySmall,
    },
  }),
};

export default AriButton;
