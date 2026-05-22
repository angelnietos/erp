import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UnauthorizedException,
  NotFoundException,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../shared/infrastructure/guards/jwt-auth.guard';
import { TechniciansService } from './technicians.service';
import {
  SetAvailabilityBodyDto,
  BulkAvailabilityBodyDto,
} from './technicians.dto';
import type { Request } from 'express';

@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  private getTenantId(req: Request): string {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) throw new UnauthorizedException('TenantID missing');
    return tenantId;
  }

  /** GET /api/technicians — lista todos los técnicos del tenant */
  @Get()
  async findAll(@Req() req: Request) {
    return this.techniciansService.findAll(this.getTenantId(req));
  }

  /** GET /api/technicians/me — técnico vinculado al usuario JWT (requiere Bearer). */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMine(@Req() req: Request) {
    const tenantId = this.getTenantId(req);
    const user = req['user'] as { sub?: string } | undefined;
    if (!user?.sub) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    const row = await this.techniciansService.findByUserId(tenantId, user.sub);
    if (!row) {
      throw new NotFoundException(
        'No hay ficha de técnico asociada a tu usuario en este tenant',
      );
    }
    return row;
  }

  /** GET /api/technicians/:id/availability — disponibilidad de un técnico */
  @Get(':id/availability')
  async getAvailability(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.techniciansService.getAvailability(
      this.getTenantId(req),
      id,
      startDate,
      endDate,
    );
  }

  /** POST /api/technicians/:id/availability — guarda disponibilidad de un día */
  @Post(':id/availability')
  @HttpCode(HttpStatus.OK)
  async setDayAvailability(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: SetAvailabilityBodyDto,
  ) {
    return this.techniciansService.setDayAvailability(
      this.getTenantId(req),
      id,
      dto,
    );
  }

  /** POST /api/technicians/:id/availability/bulk — guarda disponibilidad en bloque (bot) */
  @Post(':id/availability/bulk')
  @HttpCode(HttpStatus.OK)
  async setBulkAvailability(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: BulkAvailabilityBodyDto,
  ) {
    return this.techniciansService.setBulkAvailability(
      this.getTenantId(req),
      id,
      dto,
    );
  }

  /** POST /api/technicians/:id/availability/auto-plan — planificación automática mensual */
  @Post(':id/availability/auto-plan')
  @HttpCode(HttpStatus.OK)
  async autoPlanMonth(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { year: number; month: number },
  ) {
    return this.techniciansService.autoPlanMonth(
      this.getTenantId(req),
      id,
      body.year,
      body.month,
    );
  }
}
