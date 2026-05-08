/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 커스텀 버튼 컴포넌트
 * Spotify/YouTube Music 스타일 - Primary/Secondary/Ghost/Social 변형
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
// 아이콘 라이브러리 (react-native-vector-icons)
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, borderRadius } from '../../theme/index';

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
  /** 아이콘 이름 (Ionicons) */
  iconName?: string;
  /** 아이콘 크기 */
  iconSize?: number;
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
  iconName,
  iconSize = 20,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  const config = variantConfig[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        config.container,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={config.loaderColor}
        />
      ) : (
        <View style={styles.content}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={config.iconColor}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, config.text, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25, // Spotify 스타일 pill 버튼
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.button,
    fontWeight: typography.weights.bold,
  },
});

// 변형별 설정 맵
const variantConfig = {
  primary: {
    container: {
      backgroundColor: colors.primary,
    } as ViewStyle,
    text: {
      color: colors.white,
    } as TextStyle,
    loaderColor: colors.white,
    iconColor: colors.white,
  },
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.gray500,
    } as ViewStyle,
    text: {
      color: colors.dark.textPrimary,
    } as TextStyle,
    loaderColor: colors.dark.textPrimary,
    iconColor: colors.dark.textPrimary,
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      height: 40,
    } as ViewStyle,
    text: {
      color: colors.primaryLight,
      fontWeight: typography.weights.semibold,
    } as TextStyle,
    loaderColor: colors.primaryLight,
    iconColor: colors.primaryLight,
  },
  social: {
    container: {
      backgroundColor: colors.dark.bgSecondary,
      borderWidth: 1,
      borderColor: colors.dark.border,
      flex: 1,
      marginHorizontal: 4,
      borderRadius: borderRadius.sm,
      height: 48,
    } as ViewStyle,
    text: {
      color: colors.dark.textPrimary,
      fontSize: typography.sizes.bodySmall,
      fontWeight: typography.weights.medium,
    } as TextStyle,
    loaderColor: colors.dark.textPrimary,
    iconColor: colors.dark.textPrimary,
  },
};

export default AriButton;
