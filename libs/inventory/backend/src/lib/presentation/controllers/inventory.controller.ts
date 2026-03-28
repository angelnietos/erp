import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-data-access';
import { JwtAuthGuard } from '../../../../shared/infrastructure/guards/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getProducts() {
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        inventory: {
          select: {
            totalStock: true,
            status: true,
          }
        }
      }
    });
  }
}
