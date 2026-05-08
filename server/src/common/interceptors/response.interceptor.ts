/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 응답 변환 인터셉터
 * 모든 성공 응답을 통일된 형식으로 래핑합니다.
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// 통일된 성공 응답 인터페이스 (ARI_API_Design.md 규격)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // 이미 래핑된 응답이면 그대로 반환
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ApiResponse<T>;
        }

        // 페이지네이션 메타 정보가 포함된 경우
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          return {
            success: true,
            data: (data as Record<string, unknown>).items as T,
            meta: (data as Record<string, unknown>).meta as ApiResponse<T>['meta'],
          };
        }

        // 일반 응답 래핑
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
