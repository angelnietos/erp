/**
 * Empty shims for server-only modules (e.g. class-validator) when bundling for the browser.
 * Mirrors class-validator decorator shapes (factory vs direct property decorator).
 */
/* eslint-disable @typescript-eslint/no-unused-vars -- stubs mirror class-validator signatures */
type DecoratorTarget = object;
type PropKey = string | symbol;

const noopPropertyDecorator = (
  _target: DecoratorTarget,
  _propertyKey: PropKey,
  _descriptor?: PropertyDescriptor,
): void => {
  void 0;
};

/** @IsString(), @IsNumber(), … */
const simpleDecorator = () => noopPropertyDecorator;

/** @IsEnum(EnumType), @Min(n), … */
const paramDecorator = (_arg: unknown) => noopPropertyDecorator;

export const IsString = simpleDecorator;
export const IsNotEmpty = simpleDecorator;
export const IsOptional = simpleDecorator;
export const IsEnum = paramDecorator;
export const IsNumber = simpleDecorator;
export const IsDateString = simpleDecorator;
export const IsArray = simpleDecorator;
export const ValidateNested = paramDecorator;
export const IsBoolean = simpleDecorator;
export const Min = paramDecorator;
export const Max = paramDecorator;
export const IsEmail = simpleDecorator;
export const IsUUID = simpleDecorator;
export const IsInt = simpleDecorator;
export const IsPositive = simpleDecorator;
