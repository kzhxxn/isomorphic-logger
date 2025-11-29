import { Injectable } from '@nestjs/common';
import { Logger } from 'isomorphic-logger-ts';

@Injectable()
export class AppService {
  getHello(): string {
    Logger.info('AppService.getHello called', { ts: Date.now() });
    return 'Hello World!';
  }
}
