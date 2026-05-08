/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - TrackWatermark 엔티티
 * 포렌식 추적을 위한 워터마크 메타데이터
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Track } from '../../tracks/entities/track.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('track_watermarks')
export class TrackWatermark {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'track_id' })
  trackId!: string;

  @ManyToOne(() => Track, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'track_id' })
  track!: Track;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // 오디오 핑거프린트 해시 (유출 추적용)
  @Column({ type: 'varchar', length: 255 })
  fingerprint!: string;

  // 워터마킹 알고리즘 버전
  @Column({ type: 'varchar', length: 20, name: 'algorithm_version' })
  algorithmVersion!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'embedded_at' })
  embeddedAt!: Date;
}
