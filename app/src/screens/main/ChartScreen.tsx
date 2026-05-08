/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 차트 화면 (Placeholder)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme/index';

export const ChartPlaceholder: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>📊 차트</Text>
    <Text style={styles.sub}>실시간 차트 (Phase 2)</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark.bgPrimary, padding: spacing.lg },
  title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.dark.textPrimary, marginBottom: spacing.sm },
  sub: { fontSize: typography.sizes.body, color: colors.gray500 },
});
