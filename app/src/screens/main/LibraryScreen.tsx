/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 보관함 화면 (Placeholder)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme/index';

export const LibraryPlaceholder: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>📂 보관함</Text>
    <Text style={styles.sub}>Pocket MP3 (구현 예정)</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark.bgPrimary, padding: spacing.lg },
  title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.dark.textPrimary, marginBottom: spacing.sm },
  sub: { fontSize: typography.sizes.body, color: colors.gray500 },
});
