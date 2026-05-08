/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - ReportAction 엔티티
 * 신고 처리 이력 (법적 증거용)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Report } from './report.entity.js';
import { User } from '../../users/entities/user.entity.js';

// 처리 유형 ENUM
export enum ReportActionType {
  BLIND = 'blind',       // 블라인드 처리
  RESTORE = 'restore',   // 복원
  DELETE = 'delete',     // 영구 삭제
  REJECT = 'reject',    // 신고 반려
}

@Entity('report_actions')
export class ReportAction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'report_id' })
  reportId!: string;

  @ManyToOne(() => Report, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report!: Report;

  // 처리한 관리자
  @Column({ type: 'uuid', name: 'action_by' })
  actionBy!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'action_by' })
  admin!: User;

  @Column({ type: 'enum', enum: ReportActionType, name: 'action_type' })
  actionType!: ReportActionType;

  // 처리 사유 (법적 기록)
  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
