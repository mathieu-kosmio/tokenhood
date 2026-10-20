import type { FastifyRequest } from 'fastify';
import { negotiate, type Lang } from '@tokenhood/i18n';

export const langOf = (request: FastifyRequest): Lang => negotiate(request.headers['accept-language']);
