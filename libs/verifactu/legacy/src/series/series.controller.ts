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
import { SeriesService } from './series.service';
import { CreateSeriesDto, UpdateSeriesDto } from './dto/series.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('series')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new series' })
  @ApiResponse({ status: 201, description: 'Series created' })
  create(
    @Body() createSeriesDto: CreateSeriesDto,
    @Request() req: { user: { nif?: string } },
  ) {
    const sellerNif = req.user?.nif || 'B12345678';
    return this.seriesService.create(createSeriesDto, sellerNif);
  }

  @Get()
  @ApiOperation({ summary: 'Get all series' })
  @ApiResponse({ status: 200, description: 'List of series' })
  findAll(
    @Query('sellerNif') sellerNif?: string,
    @Request() req?: { user?: { nif?: string } },
  ) {
    const nif = sellerNif || req?.user?.nif;
    return this.seriesService.findAll(nif);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get series by type' })
  @ApiResponse({ status: 200, description: 'Series by type' })
  findByType(
    @Param('type') type: string,
    @Query('year') year: string,
    @Query('sellerNif') sellerNif: string,
    @Request() req?: { user?: { nif?: string } },
  ) {
    const nif = sellerNif || req?.user?.nif;
    return this.seriesService.findByType(
      type,
      nif || 'B12345678',
      year ? parseInt(year, 10) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get series by ID' })
  @ApiResponse({ status: 200, description: 'Series found' })
  findOne(@Param('id') id: string) {
    return this.seriesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update series' })
  @ApiResponse({ status: 200, description: 'Series updated' })
  update(@Param('id') id: string, @Body() updateSeriesDto: UpdateSeriesDto) {
    return this.seriesService.update(id, updateSeriesDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete series' })
  @ApiResponse({ status: 200, description: 'Series deleted' })
  remove(@Param('id') id: string) {
    return this.seriesService.remove(id);
  }

  @Get(':id/next')
  @ApiOperation({ summary: 'Get next invoice number' })
  @ApiResponse({ status: 200, description: 'Next invoice number' })
  getNextNumber(
    @Param('id') id: string,
    @Query('sellerNif') sellerNif: string,
    @Request() req?: { user?: { nif?: string } },
  ) {
    const nif = sellerNif || req?.user?.nif || 'B12345678';
    return this.seriesService.getNextNumber(id, nif);
  }

  @Post(':id/reset')
  @ApiOperation({ summary: 'Reset series counter' })
  @ApiResponse({ status: 200, description: 'Counter reset' })
  resetCounter(
    @Param('id') id: string,
    @Query('sellerNif') sellerNif: string,
    @Request() req?: { user?: { nif?: string } },
  ) {
    const nif = sellerNif || req?.user?.nif || 'B12345678';
    return this.seriesService.resetCounter(id, nif);
  }
}
