/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - TrackFile 엔티티
 * 음원의 실제 오디오 파일 정보 (다중 포맷/스템 지원)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Track } from './track.entity.js';

// 파일 유형 ENUM
export enum TrackFileType {
  ORIGINAL = 'original',     // 원본 파일
  COMPRESSED = 'compressed', // 압축 파일 (스트리밍용)
  STEM = 'stem',             // 악기별 분리 레이어
}

@Entity('track_files')
export class TrackFile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'track_id' })
  trackId!: string;

  @ManyToOne(() => Track, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'track_id' })
  track!: Track;

  @Column({ type: 'enum', enum: TrackFileType, name: 'file_type' })
  fileType!: TrackFileType;

  // wav, flac, mp3, ogg 등
  @Column({ type: 'varchar', length: 10 })
  format!: string;

  // 스토리지 추상화 계층의 키 (S3 key 또는 로컬 경로)
  @Column({ type: 'varchar', length: 500, name: 'storage_key' })
  storageKey!: string;

  @Column({ type: 'bigint', name: 'file_size_bytes' })
  fileSizeBytes!: number;

  // 비트레이트 (kbps)
  @Column({ type: 'integer', nullable: true })
  bitrate!: number | null;

  // 샘플레이트 (Hz)
  @Column({ type: 'integer', nullable: true, name: 'sample_rate' })
  sampleRate!: number | null;

  // 스템 라벨 (vocals, drums, bass 등 - file_type이 stem일 때)
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'stem_label' })
  stemLabel!: string | null;

  // 워터마크 삽입 여부
  @Column({ type: 'boolean', default: false, name: 'is_watermarked' })
  isWatermarked!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
