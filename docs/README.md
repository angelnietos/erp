# DTOs Architecture: Backend Validation with Shared API Contracts

## Overview

Los DTOs en este módulo implementan una estrategia de **reutilización de contratos compartidos** con validación de backend.

### Estructura

1. **DTOs del API** (`@josanz-erp/identity-api`)
   - Ubicación: `libs/isomorphic/api/identity/api/src/index.ts`
   - Son **interfaces TypeScript puras** sin decoradores
   - Definen el contrato entre frontend y backend
   - Pueden ser usadas en ambos lados

2. **DTOs del Backend** (`libs/node/backend/identity/backend/src/lib/application/dtos/`)
   - Son **clases que implementan** las interfaces del API
   - Agregan decoradores `@class-validator` para validación de NestJS
   - Se usan en el controller para validación automática

### Ejemplo

```typescript
// API (shared interface - sin validadores)
export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  category?: string;
}

// Backend (clase implementation + validadores)
export class CreateUserDto implements ICreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  // ... más propiedades con validadores
}
```

### Ventajas

✅ **Evita duplicación**: Un único DTO definido en el API
✅ **Type-safe**: Frontend y backend comparten el mismo contrato
✅ **Validación automática**: NestJS valida automáticamente en endpoints
✅ **Fácil de mantener**: Cambios en la estructura se propagan a ambos lados
✅ **Separación de concerns**: API define contrato, backend agrega validación

### Flujo de Validación

```
Request HTTP
    ↓
Controller recibe @Body() dto: CreateUserDto
    ↓
NestJS ValidationPipe valida usando los decoradores @class-validator
    ↓
Si es válido → pasa al service
    ↓
Si hay errores → retorna 400 Bad Request
```

## Mantenimiento

Cuando agregues un nuevo campo al DTO:

1. Actualiza la interfaz en `@josanz-erp/identity-api`
2. Agrega la propiedad con validadores en la clase del backend
3. Los validadores especifican las reglas de negocio del backend

Ejemplo:
```typescript
// Nuevo campo: edad
export interface CreateUserDto {
  // ... campos existentes
  age?: number;
}

// Backend agrega validación
export class CreateUserDto implements ICreateUserDto {
  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(120)
  age?: number;
}
```
