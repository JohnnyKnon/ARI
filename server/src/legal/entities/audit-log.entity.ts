/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - AuditLog 엔티티
 * 모든 주요 행위에 대한 감사 로그 (OSP 지위 유지 목적)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // 시스템 자동 액션인 경우 null
  @Index('idx_audit_user')
  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId!: string | null;

  // 행위 유형 (upload, delete, blind, login 등)
  @Column({ type: 'varchar', length: 100 })
  action!: string;

  // 대상 엔티티 유형 (track, report, user 등)
  @Index('idx_audit_entity')
  @Column({ type: 'varchar', length: 50, name: 'entity_type' })
  entityType!: string;

  // 대상 엔티티 ID
  @Column({ type: 'uuid', name: 'entity_id' })
  entityId!: string;

  // 변경 상세 내용 (JSONB - PostgreSQL 전용)
  @Column({ type: 'jsonb', nullable: true })
  details!: Record<string, unknown> | null;

  // 요청 IP 주소
  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress!: string | null;

  @Index('idx_audit_created')
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
