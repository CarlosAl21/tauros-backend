import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TwoFactorVerifyDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
