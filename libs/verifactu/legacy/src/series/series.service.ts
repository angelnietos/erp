import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoiceSeries, InvoiceSeriesDocument } from './schemas/series.schema';
import { CreateSeriesDto, UpdateSeriesDto } from './dto/series.dto';

@Injectable()
export class SeriesService {
  private readonly logger = new Logger(SeriesService.name);

  constructor(
    @InjectModel(InvoiceSeries.name)
    private seriesModel: Model<InvoiceSeriesDocument>,
  ) {}

  async create(
    createSeriesDto: CreateSeriesDto,
    sellerNif: string,
  ): Promise<InvoiceSeriesDocument> {
    const series = new this.seriesModel({
      ...createSeriesDto,
      sellerNif,
      nextNumber: createSeriesDto.nextNumber || 1,
      padding: createSeriesDto.padding || 4,
      automaticNumbering: createSeriesDto.automaticNumbering ?? true,
      resetYearly: createSeriesDto.resetYearly ?? false,
    });
    const saved = await series.save();
    this.logger.log(`Series created: ${saved._id.toString()}`);
    return saved;
  }

  async findAll(sellerNif?: string): Promise<InvoiceSeriesDocument[]> {
    const filter: Record<string, unknown> = {};
    if (sellerNif) {
      filter.sellerNif = sellerNif;
    }
    filter.active = true;
    return this.seriesModel.find(filter).sort({ name: 1 }).exec();
  }

  async findByType(
    type: string,
    sellerNif: string,
    year?: number,
  ): Promise<InvoiceSeriesDocument[]> {
    const filter: Record<string, unknown> = {
      type,
      sellerNif,
      active: true,
    };
    if (year) {
      filter.year = year;
    }
    return this.seriesModel.find(filter).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<InvoiceSeriesDocument> {
    const series = await this.seriesModel.findById(id).exec();
    if (!series) {
      throw new NotFoundException(`Series ${id} not found`);
    }
    return series;
  }

  async update(
    id: string,
    updateSeriesDto: UpdateSeriesDto,
  ): Promise<InvoiceSeriesDocument> {
    const series = await this.seriesModel
      .findByIdAndUpdate(id, updateSeriesDto, { new: true })
      .exec();
    if (!series) {
      throw new NotFoundException(`Series ${id} not found`);
    }
    this.logger.log(`Series updated: ${id}`);
    return series;
  }

  async remove(id: string): Promise<void> {
    // Soft delete - just set active to false
    const result = await this.seriesModel
      .findByIdAndUpdate(id, { active: false }, { new: true })
      .exec();
    if (!result) {
      throw new NotFoundException(`Series ${id} not found`);
    }
    this.logger.log(`Series soft deleted: ${id}`);
  }

  async getNextNumber(
    seriesId: string,
    sellerNif: string,
  ): Promise<{ invoiceNumber: string; nextNumber: number }> {
    const series = await this.seriesModel
      .findOne({ _id: seriesId, sellerNif, active: true })
      .exec();

    if (!series) {
      throw new NotFoundException(`Active series ${seriesId} not found`);
    }

    // Check if we need to reset for new year
    const currentYear = new Date().getFullYear();
    if (series.resetYearly && series.year !== currentYear) {
      // Reset counter for new year
      series.year = currentYear;
      series.nextNumber = 1;
      await series.save();
    }

    const invoiceNumber = `${series.prefix}${series.nextNumber
      .toString()
      .padStart(series.padding, '0')}`;

    // Increment for next use if automatic numbering is enabled
    if (series.automaticNumbering) {
      series.nextNumber += 1;
      await series.save();
    }

    return { invoiceNumber, nextNumber: series.nextNumber };
  }

  async resetCounter(
    id: string,
    sellerNif: string,
  ): Promise<InvoiceSeriesDocument> {
    const series = await this.seriesModel
      .findOneAndUpdate(
        { _id: id, sellerNif },
        { nextNumber: 1 },
        { new: true },
      )
      .exec();

    if (!series) {
      throw new NotFoundException(`Series ${id} not found`);
    }

    this.logger.log(`Series counter reset: ${id}`);
    return series;
  }
}
