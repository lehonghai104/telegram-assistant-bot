import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('public')
@Controller()
export class AppController {
  @Get()
  async heathCheck() {
    return { message: `${process.env.npm_package_name} ${process.env.npm_package_version} still running`, timestamp: Date.now() }
  }
}
