export class CreateEventDto {
  tenantId: string;
  name: string;
  clientId?: string;
  startDate: Date;
  endDate: Date;
  summary?: string;
  status?: string;
  location?: string;
  notes?: string;
}
