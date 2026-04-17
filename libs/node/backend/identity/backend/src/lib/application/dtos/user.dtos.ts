import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import {
  CreateUserDto as ICreateUserDto,
  UpdateUserDto as IUpdateUserDto,
} from '@josanz-erp/identity-api';

// Re-export LoginCredentials using export...from syntax
export { LoginCredentials } from '@josanz-erp/identity-api';

/**
 * Backend implementation of CreateUserDto with NestJS validation decorators.
 * Implements the ICreateUserDto interface from the shared API.
 */
export class CreateUserDto implements ICreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @IsArray()
  @IsString({ each: true })
  roles!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  extraPermissions?: string[];

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category?: string;
}

/**
 * Backend implementation of UpdateUserDto with NestJS validation decorators.
 * Implements the IUpdateUserDto interface from the shared API.
 */
export class UpdateUserDto implements IUpdateUserDto {
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsEmail()
  email?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  extraPermissions?: string[];

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Aliases for backward compatibility
export const CreateUserBackendDto = CreateUserDto;
export const UpdateUserBackendDto = UpdateUserDto;
