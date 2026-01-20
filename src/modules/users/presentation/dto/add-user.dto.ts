import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class AddUserDto {
  @ApiPropertyOptional({ description: 'If omitted, will be generated randomly' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ description: 'If omitted, will be generated randomly' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'If omitted, will be generated randomly' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  phone?: string;

  @ApiPropertyOptional({ description: 'If omitted, will be generated randomly', example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}

