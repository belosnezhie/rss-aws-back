import { Controller, Get, Headers, Put, Body, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import axios, { AxiosHeaders } from 'axios';
import { PutCartPayload, CreateOrderDto } from './model';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/product')
  async getProduct(@Headers() headers): Promise<any> {
    this.logger.log(headers);

    const axiosHeaders = new AxiosHeaders(headers);
    axiosHeaders.delete('host');

    const res = await axios.get(
      `${process.env.PRODUCT}/products`,
      {
        headers: axiosHeaders,
      }
    );
    this.logger.log(res.data);
    return res.data;
  }

  @Get('/cart')
  async getCart(@Headers() headers): Promise<any> {
    this.logger.log(headers);

    const axiosHeaders = new AxiosHeaders(headers);
    axiosHeaders.delete('host');

    const res = await axios.get(
      `${process.env.CART}/profile/cart`,
      {
        headers: axiosHeaders,
      }
    );
    this.logger.log(res.data);
    return res.data;
  }

  @Put('/cart')
  async putInCart(
    @Headers() headers,
    @Body() body: PutCartPayload,
  ): Promise<any> {
    this.logger.log(headers);
    this.logger.log(body);

    const axiosHeaders = new AxiosHeaders(headers);
    axiosHeaders.delete('host');

    const res = await axios.put(
      `${process.env.CART}/profile/cart`,
      body,
      {
        headers: axiosHeaders,
      }
    );
    this.logger.log(res.data);
    return res.data;
  }

  @Get('/cart/order')
  async getOrder(@Headers() headers): Promise<any> {
    this.logger.log(headers);

    const axiosHeaders = new AxiosHeaders(headers);
    axiosHeaders.delete('host');

    const res = await axios.get(
      `${process.env.CART}/profile/cart/order`,
      {
        headers: axiosHeaders,
      }
    );
    this.logger.log(res.data);
    return res.data;
  }

  @Put('/cart/order')
  async createOrder(
    @Headers() headers,
    @Body() body: CreateOrderDto,
  ): Promise<any> {
    this.logger.log(headers);
    this.logger.log(body);

    const axiosHeaders = new AxiosHeaders(headers);
    axiosHeaders.delete('host');

    const res = await axios.put(
      `${process.env.CART}/profile/cart/order`,
      body,
      {
        headers: axiosHeaders,
      }
    );
    this.logger.log(res.data);
    return res.data;
  }
}
