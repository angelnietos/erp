import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';

export class UpsertVerifactuCredentialsDto {
  @ApiProperty({
    description: 'Entorno AEAT asociado al certificado',
    enum: ['test', 'production'],
  })
  @IsIn(['test', 'production'])
  environment!: 'test' | 'production';

  @ApiProperty({
    description: 'Certificado X.509 en PEM (incl. cabeceras)',
    minLength: 80,
    writeOnly: true,
  })
  @IsString()
  @MinLength(80)
  certificatePem!: string;

  @ApiProperty({
    description: 'Clave privada en PEM (PKCS#8 o RSA)',
    minLength: 80,
    writeOnly: true,
  })
  @IsString()
  @MinLength(80)
  privateKeyPem!: string;
}
