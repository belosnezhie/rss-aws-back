import { Controller, Get, Req, Query, Body, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import axios, { AxiosHeaders } from 'axios';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/product')
  async getProduct(@Headers() headers): Promise<any> {
    console.log(headers);

    const axiosHeaders = new AxiosHeaders(headers);
    axiosHeaders.delete('host');

    const res = await axios.get(
      `${process.env.PRODUCT}/products`,
      {
        headers: axiosHeaders,
      }
    );
    console.log(res.data)
    return res.data;
  }

  @Get('/cart')
  async getCart(): Promise<any> {
    const response = await fetch('XXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    const data = await response.json();
    return data;
  }
}
