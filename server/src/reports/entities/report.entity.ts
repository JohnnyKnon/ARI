/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - Report 엔티티
 * Notice & Takedown 신고 관리 (법적 방어)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Track } from '../../tracks/entities/track.entity.js';

// 신고 사유 ENUM
export enum ReportReason {
  COPYRIGHT = 'copyright',
  INAPPROPRIATE = 'inappropriate',
  FRAUD = 'fraud',
  OTHER = 'other',
}

// 신고 상태 ENUM (Notice & Takedown 워크플로우)
export enum ReportStatus {
  PENDING = 'pending',       // 접수됨
  REVIEWING = 'reviewing',   // 검토 중
  BLINDED = 'blinded',       // 블라인드 처리됨
  REJECTED = 'rejected',     // 반려됨
  RESOLVED = 'resolved',     // 해결됨 (복원 또는 영구삭제)
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'reporter_id' })
  reporterId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter!: User;

  @Column({ type: 'uuid', name: 'track_id' })
  trackId!: string;

  @ManyToOne(() => Track, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'track_id' })
  track!: Track;

  @Column({ type: 'enum', enum: ReportReason })
  reason!: ReportReason;

  @Column({ type: 'text' })
  description!: string;

  // 증거 자료 URL 배열
  @Column({ type: 'text', array: true, nullable: true, name: 'evidence_urls' })
  evidenceUrls!: string[] | null;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status!: ReportStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
