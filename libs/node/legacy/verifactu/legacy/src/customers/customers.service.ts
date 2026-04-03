import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async create(
    createCustomerDto: CreateCustomerDto,
    sellerNif: string,
  ): Promise<CustomerDocument> {
    const customer = new this.customerModel({
      ...createCustomerDto,
      sellerNif,
    });
    const saved = await customer.save();
    this.logger.log(`Customer created: ${saved._id.toString()}`);
    return saved;
  }

  async findAll(
    sellerNif?: string,
    type?: string,
  ): Promise<CustomerDocument[]> {
    const filter: Record<string, unknown> = {};
    if (sellerNif) filter.sellerNif = sellerNif;
    if (type) filter.type = type;
    filter.active = true;
    return this.customerModel.find(filter).sort({ name: 1 }).exec();
  }

  async search(query: string, sellerNif: string): Promise<CustomerDocument[]> {
    const regex = new RegExp(query, 'i');
    return this.customerModel
      .find({
        sellerNif,
        active: true,
        $or: [{ taxId: regex }, { name: regex }, { tradeName: regex }],
      })
      .limit(20)
      .exec();
  }

  async findOne(id: string): Promise<CustomerDocument> {
    const customer = await this.customerModel.findById(id).exec();
    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found`);
    }
    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerDocument> {
    const customer = await this.customerModel
      .findByIdAndUpdate(id, updateCustomerDto, { new: true })
      .exec();
    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found`);
    }
    this.logger.log(`Customer updated: ${id}`);
    return customer;
  }

  async remove(id: string): Promise<void> {
    // Soft delete - just set active to false
    const result = await this.customerModel
      .findByIdAndUpdate(id, { active: false }, { new: true })
      .exec();
    if (!result) {
      throw new NotFoundException(`Customer ${id} not found`);
    }
    this.logger.log(`Customer soft deleted: ${id}`);
  }
}
