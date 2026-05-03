import { PartialType } from '@nestjs/mapped-types';
import { CreateComposicionCorporalDto } from './create-composicion-corporal.dto';

export class UpdateComposicionCorporalDto extends PartialType(CreateComposicionCorporalDto) {
}
