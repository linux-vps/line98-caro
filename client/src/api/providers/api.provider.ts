import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, of } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ApiProvider {
  private baseUrl = process.env.API_BASE_URL;  

  constructor(private readonly httpService: HttpService) {
    console.log('Base URL:', this.baseUrl);   
  }

  private async sendRequest(
    uri: string,
    options: {
      headers?: any;
      body?: any;
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    } = {} 
  ): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('API_BASE_URL is not defined');
    }
  
    const axiosOptions: AxiosRequestConfig = {
      url: `${this.baseUrl}/${uri}`.replace(/\/+/g, '/'), 
      method: options.method || 'GET',
      headers: {
        accept: 'application/json',
        ...options.headers,
      },
      data: options.body,
    };
  
    return lastValueFrom(
      this.httpService.request(axiosOptions).pipe(
        map((response: AxiosResponse) => {
          return response.data;
        }),
        catchError((error) => {
          console.log("log error ra", error);
          // Trả về dữ liệu lỗi thay vì ném lỗi
          try {
            const data = of(error.response?.data || { error: 'Request failed' });
            return data;
          } catch (error) {
            console.log("log error ra", error);
            return of({ error: 'Request failed' });
          }
        })
      )
    );
  }
  

  public async request(
    uri: string,
    options: {
      headers?: any;
      body?: any;
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    } = {}
  ): Promise<any> {
    return this.sendRequest(uri, options);
  }
}
