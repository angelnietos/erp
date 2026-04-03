import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created' })
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @Request() req: { user: { nif?: string } },
  ) {
    const sellerNif = req.user?.nif || 'B12345678'; // TODO: Get from auth
    return this.customersService.create(createCustomerDto, sellerNif);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'List of customers' })
  findAll(
    @Query('sellerNif') sellerNif?: string,
    @Query('type') type?: string,
    @Request() req?: { user?: { nif?: string } },
  ) {
    const nif = sellerNif || req?.user?.nif;
    return this.customersService.findAll(nif, type);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search customers by taxId or name' })
  @ApiResponse({ status: 200, description: 'Search results' })
  search(
    @Query('q') query: string,
    @Query('sellerNif') sellerNif: string,
    @Request() req?: { user?: { nif?: string } },
  ) {
    const nif = sellerNif || req?.user?.nif;
    return this.customersService.search(query, nif || 'B12345678');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer found' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, description: 'Customer updated' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
