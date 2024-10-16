import * as admin from 'firebase-admin';
export declare class FirebaseService {
    constructor();
    getAdmin(): typeof admin;
    getFirestore(): admin.firestore.Firestore;
    getAuth(): import("firebase-admin/lib/auth/auth").Auth;
}
