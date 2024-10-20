import { MinLength } from 'class-validator';

export class GenerateTokenDto {
  @MinLength(1, {
    message: 'User Id needs to be 1 character at least',
  })
  userId: string;
}
