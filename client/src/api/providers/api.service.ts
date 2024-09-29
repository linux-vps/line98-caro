import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { ApiProvider } from './api.provider';
import { TokensService } from '../../tokens/providers/tokens.service';
import { PatchUserDto } from '../dtos/user/patch-user.dto';
import { ChangePasswordDto } from '../dtos/user/change-password.dto';

@Injectable()
export class ApiService {

  constructor(
    private httpService: HttpService,
    private apiProvider: ApiProvider,
    private tokensService: TokensService

  ) {}

  async signIn(createUserDto: CreateUserDto) {
    const body = {
      username: createUserDto.username,
      password: createUserDto.password,
    };
    console.log(body);

    const data = await this.apiProvider.request(
      'auth/sign-in', 
      {
        method: 'POST',
        body: body,
        // headers: {
        //   'Authorization': `Bearer ${this.tokensService.getAccessToken()}`
        // },
      }
    );
    return data;
  }

  async getUser(id: number, accessToken: string){
    if(!accessToken){
      return {error: 'Access token is required'};
    }
    console.log(accessToken);
    const data = await this.apiProvider.request(
      `users/${id}`, 
      {
        // method: 'GET',
        // body: body,
        headers: {
          'Authorization': accessToken
        },
      }
    );
    return data;
  }

  async register(createUserDto: CreateUserDto) {
    const body = { 
      username: createUserDto.username, 
      password: createUserDto.password,
      email: createUserDto.email,
      age: createUserDto.age,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
    };
    const data = await this.apiProvider.request(
      `users`, 
      {
        method: 'POST',
        body: body,
        // headers: {
        //   'Authorization': `Bearer ${accessToken}`
        // },
      }
    );
    return data;
  }

  async updateUser(id: number, patchUserDto: PatchUserDto, accessToken: string) {
    const data = await this.apiProvider.request(
      `users/${id}`, 
      {
        method: 'PATCH', 
        body: { 
          email: patchUserDto.email,
          firstName: patchUserDto.firstName,
          lastName: patchUserDto.lastName,
          age: patchUserDto.age,
         },
        headers: {
          'Authorization': accessToken
        },
      }
    );
    return data;
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto, accessToken: string) {
    const data = await this.apiProvider.request(
      `users/${id}/change-password`, 
      {
        method: 'PATCH', 
        body: { 
          currentPassword: changePasswordDto.currentPassword,
          newPassword: changePasswordDto.newPassword,
         },
        headers: {
          'Authorization': accessToken
        },
      }
    );
    return data;
  }

}
