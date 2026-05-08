/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - Public 데코레이터
 * 인증 없이 접근 가능한 엔드포인트에 사용
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() - 해당 라우트는 JWT 인증 없이 접근 가능
 * @example
 * @Public()
 * @Get('tracks')
 * findAll() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
