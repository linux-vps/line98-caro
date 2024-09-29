import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TokensService {
  private tokens: { accessToken: string; refreshToken: string };
  private readonly API_BASE_URL: string;

  constructor(private httpService: HttpService) {
    this.API_BASE_URL = process.env.API_BASE_URL;
    this.tokens = {
      accessToken: process.env.INITIAL_ACCESS_TOKEN || '',
      refreshToken: process.env.INITIAL_REFRESH_TOKEN || ''
    };
    this.initializeTokenRefresh();
  }

  private initializeTokenRefresh() {
    // 5 phút = 5 * 60 * 1000 = 300,000 milliseconds
    setInterval(() => this.refreshTokens(), 5 * 60 * 1000); // 5 phút
    console.log('Bắt đầu làm mới token mỗi 5 phút');
  }

  async refreshTokens() {
    if (!this.tokens.refreshToken) return;

    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.API_BASE_URL}/auth/refresh-tokens`, {
          refreshToken: this.tokens.refreshToken,
        })
      );
      this.saveTokens(response.data);
      return response.data;
    } catch (error) { 
      console.error('Lỗi khi làm mới token:', error);
    }
  }

  private saveTokens(tokens: { accessToken: string; refreshToken: string }) {
    this.tokens = tokens;
  }

  async getAccessToken(): Promise<string> {
    return this.tokens.refreshToken;
  }

  setInitialTokens(tokens: { accessToken: string; refreshToken: string }) { 
    this.saveTokens(tokens);
  }
}
