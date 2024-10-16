import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import configs from '../configs';

const saltOrRounds = 10;
export const encryptPassword = async (password: string) => {
  const encryptedPassword = await bcrypt.hash(password, saltOrRounds);
  return encryptedPassword;
};

export const isPasswordMatch = async (
  password: string,
  userPassword: string,
) => {
  return bcrypt.compare(password, userPassword);
};

export const generateFakeJwt = async (): Promise<string> => {
  const fakeUser = {
    userId: 'testUser',
    scopes: ['read', 'write'],
  };
  return jwt.sign(fakeUser, configs.jwt.secret, { expiresIn: '1h' });
};
