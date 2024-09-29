import { Controller, Get, Render } from '@nestjs/common';

import { AppService } from './app.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    console.log("CLIENT_URL: ", process.env.CLIENT_URL);
  }
}
