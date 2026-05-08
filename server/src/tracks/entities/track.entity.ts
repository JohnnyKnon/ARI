/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - Track 엔티티
 * AI 음원 메타데이터를 관리합니다.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_tracks_user')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Index('idx_tracks_genre_mood')
  @Column({ type: 'varchar', length: 50 })
  genre!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mood!: string | null;

  // 쉼표 구분 태그 (검색용)
  @Column({ type: 'varchar', length: 500, nullable: true })
  tags!: string | null;

  // 재생 시간 (초 단위)
  @Column({ type: 'integer', name: 'duration_sec' })
  durationSec!: number;

  @Column({ type: 'integer', nullable: true })
  bpm!: number | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'key_signature' })
  keySignature!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'cover_image_url' })
  coverImageUrl!: string | null;

  @Index('idx_tracks_public')
  @Column({ type: 'boolean', default: true, name: 'is_public' })
  isPublic!: boolean;

  // 신고에 의한 블라인드 처리 (Notice & Takedown)
  @Column({ type: 'boolean', default: false, name: 'is_blinded' })
  isBlinded!: boolean;

  // 카운터 필드 (성능을 위해 비정규화)
  @Column({ type: 'bigint', default: 0, name: 'play_count' })
  playCount!: number;

  @Column({ type: 'integer', default: 0, name: 'like_count' })
  likeCount!: number;

  @Column({ type: 'integer', default: 0, name: 'share_count' })
  shareCount!: number;

  @Column({ type: 'integer', default: 0, name: 'download_count' })
  downloadCount!: number;

  // AI 모델 정보 (투명성 - 법적 방어)
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'ai_model_used' })
  aiModelUsed!: string | null;

  @Index('idx_tracks_created')
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
