/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 홈 화면 (Placeholder)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme/index';

export const HomePlaceholder: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>🎵 ARI 홈</Text>
    <Text style={styles.sub}>추천 음원 피드 (구현 예정)</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark.bgPrimary, padding: spacing.lg },
  title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.dark.textPrimary, marginBottom: spacing.sm },
  sub: { fontSize: typography.sizes.body, color: colors.gray500 },
});
