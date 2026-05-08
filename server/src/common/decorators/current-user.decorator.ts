/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 현재 사용자 데코레이터
 * 컨트롤러에서 @CurrentUser()로 인증된 사용자 정보를 가져옵니다.
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * JWT 인증 후 request.user에 담긴 사용자 정보를 추출
 * @example
 * @Get('me')
 * getProfile(@CurrentUser() user: JwtPayload) { ... }
 *
 * @Get('me')
 * getUserId(@CurrentUser('userId') userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    // 특정 필드만 요청된 경우
    if (data && user) {
      return (user as Record<string, unknown>)[data];
    }

    return user;
  },
);
