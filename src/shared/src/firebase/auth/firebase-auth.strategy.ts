import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import configs from '../../configs';
import { Request } from 'express';
import { auth } from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configs.jwt.secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const accessToken = req.headers['authorization'];
    const decodedToken: DecodedIdToken = await auth()
      .verifyIdToken(accessToken, true)
      .catch((err) => {
        console.error(err);
        throw new UnauthorizedException();
      });

    return {
      userId: decodedToken.sub,
      email: decodedToken.email ?? payload.email,
    };
  }
}
