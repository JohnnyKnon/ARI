/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - UserSession 엔티티
 * JWT Refresh Token 세션 관리 (Anti-Hijacking)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity.js';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_sessions_user')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Refresh Token을 SHA-256 해시로 저장 (원본 저장 금지)
  @Index('idx_sessions_token')
  @Column({ type: 'varchar', length: 255, name: 'refresh_token_hash' })
  refreshTokenHash!: string;

  // User-Agent 해시 (토큰 바인딩용)
  @Column({ type: 'varchar', length: 64, name: 'user_agent_hash' })
  userAgentHash!: string;

  // 접속 IP (토큰 바인딩용)
  @Column({ type: 'varchar', length: 45, name: 'ip_address' })
  ipAddress!: string;

  // 디바이스 이름 (세션 관리 UI용)
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'device_name' })
  deviceName!: string | null;

  // 폐기 여부 (Refresh Token Rotation 시 이전 토큰 폐기)
  @Column({ type: 'boolean', default: false, name: 'is_revoked' })
  isRevoked!: boolean;

  // 만료 시각
  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
