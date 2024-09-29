import { Controller, Post, Body, Get, Query, Headers, Param, Patch } from '@nestjs/common';
import { ApiService } from './providers/api.service';
import { GetUsersParamDto } from './dtos/user/get-user-param.dto';
import { CreateUserDto } from './dtos/user/create-user.dto';
import { PatchUserDto } from './dtos/user/patch-user.dto';
import { ChangePasswordDto } from './dtos/user/change-password.dto';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post('sign-in')
  signIn(@Body() createUserDto: CreateUserDto) {
    return this.apiService.signIn(createUserDto);
  }
 
  // @Post('refresh-tokens')
  // refreshTokens(
  //   @Body('refreshToken') refreshToken: string,
  // ) {
  //   return this.apiService.refreshTokens(refreshToken);
  // }

  @Get('user/:id')
  getUser(
    @Param() getUserParamDto: GetUsersParamDto,
    @Headers('Authorization') authorization: string,
  ) {

    return this.apiService.getUser(getUserParamDto.id, authorization||undefined);
  }
  
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.apiService.register(createUserDto);
  }

  @Patch('user/:id')
  updateUser(
    @Body() patchUserDto: PatchUserDto,
    @Param() getUsersParamDto: GetUsersParamDto,
    @Headers('Authorization') authorization: string,
  ) {
    return this.apiService.updateUser(getUsersParamDto.id ,patchUserDto, authorization||undefined);
  }

  @Patch('user/:id/change-password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param() getUsersParamDto: GetUsersParamDto,
    @Headers('Authorization') authorization: string,
  ) {
    return this.apiService.changePassword(getUsersParamDto.id, changePasswordDto, authorization||undefined);
  }
}
