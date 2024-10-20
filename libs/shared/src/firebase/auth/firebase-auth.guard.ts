import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FirebaseAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  // @ts-ignore
  handleRequest(err, user, _info) {
    // You can throw an exception based on either "info" or "err" arguments
    console.log(err, user, _info);
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
