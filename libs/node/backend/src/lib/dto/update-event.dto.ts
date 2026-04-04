import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto implements Partial<CreateEventDto> {
  tenantId?: string;
  name?: string;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  summary?: string;
  status?: string;
  location?: string;
  notes?: string;
}
