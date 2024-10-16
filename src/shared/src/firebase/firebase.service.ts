import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.PROJECT_ID,
          clientEmail: process.env.CLIENT_EMAIL,
          privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  // Firebase admin instance
  getAdmin() {
    return admin;
  }

  // Firestore instance
  getFirestore() {
    return admin.firestore();
  }

  // Firebase Authentication instance
  getAuth() {
    return admin.auth();
  }
}
