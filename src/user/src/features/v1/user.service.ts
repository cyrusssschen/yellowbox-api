import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from 'shared/src/firebase';
import { encryptPassword, isPasswordMatch } from 'shared/src/utils/encryption';
import ApplicationException from 'shared/src/types/exceptions/application.exception';

@Injectable()
export class UserService {
  private db = this.firebaseService.getFirestore();

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly jwtService: JwtService,
  ) {}

  // Create a new user and generate a token
  async createUser(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (user) {
      throw new ConflictException(
        'Create User failed as the user already exist',
      );
    }

    const uuid = uuidv4();
    await this.db
      .collection('user')
      .doc(`user_${uuid}`)
      .set({
        email,
        password: await encryptPassword(password),
      });

    return {
      id: uuid,
      email,
    };
  }

  async findUserById(id: string) {
    const user = await this.db.collection('user').doc(id).get();
    if (!user.exists) {
      return undefined;
    }

    const data = user.data();
    return {
      id: data.id,
      email: data.email,
    };
  }

  async findUserByEmail(email: string) {
    const user = await this.db
      .collection('user')
      .where('email', '==', email)
      .get();

    if (user.empty) {
      return undefined;
    }

    const userData = user?.docs[0].data();
    return {
      email,
      id: userData.id,
      password: userData.password,
    };
  }

  // Generate JWT token by login
  async login(email: string, password: string) {
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    if (!(await isPasswordMatch(password, user.password))) {
      throw new ApplicationException('Password is incorrect');
    }

    const payload = { sub: user.id };
    return this.jwtService.sign(payload);
  }
}
