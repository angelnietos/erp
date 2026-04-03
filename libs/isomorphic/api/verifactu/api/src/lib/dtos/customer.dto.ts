export class AddressDto {
  street?: string;
  number?: string;
  floor?: string;
  door?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  country?: string;
}

export class CreateCustomerDto {
  type: string;
  idType: string;
  taxId: string;
  name: string;
  tradeName?: string;
  address?: AddressDto;
  phone?: string;
  email?: string;
  web?: string;
  ivaRegime?: string;
  ivaIncluded?: boolean;
  retention?: number;
  autonomousCommunity?: string;
  province?: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {
  active?: boolean;
}

export class CustomerResponseDto {
  id: string;
  type: string;
  idType: string;
  taxId: string;
  name: string;
  tradeName?: string;
  address?: AddressDto;
  phone?: string;
  email?: string;
  web?: string;
  ivaRegime?: string;
  ivaIncluded: boolean;
  retention?: number;
  autonomousCommunity?: string;
  province?: string;
  sellerNif: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
