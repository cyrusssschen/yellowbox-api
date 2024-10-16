import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(8, {
    message: 'Minimum length of password is 5 characters',
  })
  @IsNotEmpty()
  password: string;
}
