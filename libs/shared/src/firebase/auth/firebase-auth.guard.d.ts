import { ExecutionContext } from '@nestjs/common';
declare const FirebaseAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class FirebaseAuthGuard extends FirebaseAuthGuard_base {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
    handleRequest(err: any, user: any, _info: any): any;
}
export {};
