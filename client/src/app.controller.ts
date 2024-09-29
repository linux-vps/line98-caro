import { Body, Controller, Get, Post, Redirect, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { Pages } from './enums/pages.enum';
import { ApiService } from './api/providers/api.service';

@Controller()
export class AppController {
  private baseUrl = process.env.API_BASE_URL;  
  constructor(
    private readonly appService: AppService,
  ) {}

  @Get()
  @Redirect(Pages.INDEX)
  hello() {
    console.log(Pages.INDEX);
    return { apiUrl: this.baseUrl };
  }
  @Get(Pages.INDEX)
  @Render(Pages.INDEX)  
  hello2() {
    console.log(Pages.INDEX);
    return { apiUrl: this.baseUrl };
  }

  @Get(Pages.SIGN_IN)
  @Render(Pages.SIGN_IN)
  signInPage() {
      console.log(Pages.SIGN_IN);
      return { apiUrl: this.baseUrl };
  }

  @Get(Pages.USER_PROFILE)
  @Render(Pages.USER_PROFILE)
  userProfile() { 
      console.log(Pages.USER_PROFILE);
      return { apiUrl: this.baseUrl };
  }

  @Get(Pages.REGISTER)
  @Render(Pages.REGISTER)
  register() {
      console.log(Pages.REGISTER)
      return { apiUrl: this.baseUrl };
  }

  @Get(Pages.LINE98)
  @Render(Pages.LINE98)
  line98() {
      console.log(Pages.LINE98)
      return { apiUrl: this.baseUrl };
  } 

  @Get(Pages.CARO)
  @Render(Pages.CARO) 
  caro() {
      console.log(Pages.CARO)
      return { apiUrl: this.baseUrl };
  }

  @Get(Pages.GAME)
  @Render(Pages.GAME)
  game() {
      console.log(Pages.GAME)
      return { apiUrl: this.baseUrl };
  }
  

}
