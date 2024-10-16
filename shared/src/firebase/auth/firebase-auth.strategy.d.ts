import { Request } from 'express';
declare const FirebaseAuthStrategy_base: new (...args: any[]) => any;
export declare class FirebaseAuthStrategy extends FirebaseAuthStrategy_base {
    constructor();
    validate(req: Request, payload: any): Promise<{
        userId: string;
        email: any;
    }>;
}
export {};
