import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { PartialType, OmitType } from '@nestjs/swagger';

export class PatchUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'username'] as const)
) {}
