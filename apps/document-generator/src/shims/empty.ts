/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars -- shims de decoradores para el bundle del navegador */
// Empty shim for server-only modules when bundling for browser
export const IsString =
  () => (target: any, propertyKey: string, descriptor?: any) => {};
export const IsNotEmpty =
  () => (target: any, propertyKey: string, descriptor?: any) => {};
export const IsOptional =
  () => (target: any, propertyKey: string, descriptor?: any) => {};
export const IsEnum =
  (enumType: any) => (target: any, propertyKey: string, descriptor?: any) => {};
export const IsNumber =
  () => (target: any, propertyKey: string, descriptor?: any) => {};
export const IsDateString =
  () => (target: any, propertyKey: string, descriptor?: any) => {};
export const IsArray =
  () => (target: any, propertyKey: string, descriptor?: any) => {};
export const ValidateNested =
  (options?: any) => (target: any, propertyKey: string, descriptor?: any) => {};
export const IsBoolean =
  () => (target: any, propertyKey: string, descriptor?: any) => {};
export const Min =
  (value: number) => (target: any, propertyKey: string, descriptor?: any) => {};
export const Max =
  (value: number) => (target: any, propertyKey: string, descriptor?: any) => {};
export const IsEmail =
  () => (target: any, propertyKey: string, descriptor?: any) => {};
export const IsUUID =
  () => (target: any, propertyKey: string, descriptor?: any) => {};
export const IsInt =
  () => (target: any, propertyKey: string, descriptor?: any) => {};
export const IsPositive =
  () => (target: any, propertyKey: string, descriptor?: any) => {};
// Add more as needed
