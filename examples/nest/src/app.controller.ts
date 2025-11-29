import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Logger } from 'isomorphic-logger-ts';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hc')
  getHello(): string {
    Logger.info('AppController.getHello called', { ts: Date.now() });
    return this.appService.getHello();
  }
}
