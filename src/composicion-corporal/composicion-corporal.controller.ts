import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComposicionCorporalService } from './composicion-corporal.service';
import { CreateComposicionCorporalDto } from './dto/create-composicion-corporal.dto';
import { UpdateComposicionCorporalDto } from './dto/update-composicion-corporal.dto';

@Controller('composicion-corporal')
export class ComposicionCorporalController {
  constructor(private readonly composicionCorporalService: ComposicionCorporalService) {}

  @Post()
  create(@Body() createComposicionCorporalDto: CreateComposicionCorporalDto) {
    return this.composicionCorporalService.create(createComposicionCorporalDto);
  }

  @Get()
  findAll() {
    return this.composicionCorporalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.composicionCorporalService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComposicionCorporalDto: UpdateComposicionCorporalDto) {
    return this.composicionCorporalService.update(id, updateComposicionCorporalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.composicionCorporalService.remove(id);
  }
}
