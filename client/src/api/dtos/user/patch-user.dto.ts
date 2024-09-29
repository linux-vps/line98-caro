import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { PartialType, OmitType } from '@nestjs/swagger';

export class PatchUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'username'] as const)
) {
  @IsNumber()
  @IsOptional()
  age: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(96)
  firstName: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(96)
  lastName?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(96)
  email: string;

}
