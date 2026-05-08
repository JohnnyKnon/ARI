/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 전역 HTTP 예외 필터
 * 모든 예외를 통일된 JSON 형식으로 반환합니다.
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // HTTP 예외인 경우 상태 코드와 메시지 추출
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : null;

    // 에러 코드 및 메시지 결정
    const errorCode =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>)['error'] || 'INTERNAL_ERROR'
        : 'INTERNAL_ERROR';

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>)['message'] || '서버 오류가 발생했습니다.'
        : typeof exceptionResponse === 'string'
          ? exceptionResponse
          : '서버 오류가 발생했습니다.';

    // 500 에러는 로그에 상세 기록 (보안상 클라이언트에 노출하지 않음)
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // 통일된 에러 응답 형식 (ARI_API_Design.md 규격 준수)
    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message: message,
        statusCode: status,
      },
    });
  }
}
