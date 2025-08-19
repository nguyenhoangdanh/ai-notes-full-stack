import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { JwtPayload, User } from '../../types/user.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Primary: Extract from cookie (preferred for cross-platform compatibility)
        (request: Request) => {
          const token = request?.cookies?.['ai-notes-token'];
          if (token) {
            return token;
          }
          return null;
        },
        // Fallback: Extract from Authorization header (for iOS/macOS if cookies are blocked)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Additional fallback: Custom header for iOS compatibility
        (request: Request) => {
          return request?.headers?.['x-access-token'] as string;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      // Pass the request to validate method for additional context
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload): Promise<User | null> {
    return await this.authService.validateUser(payload);
  }
}
