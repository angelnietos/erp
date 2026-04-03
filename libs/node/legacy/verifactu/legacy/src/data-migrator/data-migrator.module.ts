import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DataMigratorController } from './data-migrator.controller';

/**
 * Módulo de migración y exportación de datos.
 * Expone API para exportar/importar Excel y CSV con mapeo legacy.
 * Usado por VeriFactu y Gestión 360 (clientes, facturas, etc.).
 */
@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  ],
  controllers: [DataMigratorController],
})
export class DataMigratorModule {}
