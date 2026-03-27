import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateBudgetDto {
  @IsUUID()
  @IsNotEmpty()
  clientId!: string;
}
