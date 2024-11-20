import { Token } from '@prisma/client';
import { Role } from 'src/types/types';

export interface Tokens {
  accessToken: string;
  refreshToken: Token;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: Role;
  fullname: string;
  isVerified: true;
  isBlocked: true;
}
