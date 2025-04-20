import { Controller, Get, Header, Headers, Put, Body, Logger, Options } from '@nestjs/common';
import { AppService } from './app.service';
import axios, { AxiosHeaders } from 'axios';
import { PutCartPayload, CreateOrderDto } from './model';
import { GenericResponse } from './generic-response.decorator';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Options("/product")
  @Options("/cart")
  options(@GenericResponse() resp: GenericResponse): any {
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    resp.setStatus(204);
    return true;
  }

  @Get('/product')
  async getProduct(@Headers() headers, @GenericResponse() resp: GenericResponse): Promise<any> {
    resp.setHeader('Access-Control-Allow-Origin', '*');
    resp.setHeader('Access-Control-Expose-Headers', '*');
    resp.setHeader('Access-Control-Allow-Credentials', 'true');
    resp.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    this.logger.log(headers);

    const axiosHeaders = new AxiosHeaders(headers);
    axiosHeaders.delete('host');
    axiosHeaders.delete('connection');
    axiosHeaders.delete('content-length');

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
  async getCart(@Headers() headers, @GenericResponse() resp: GenericResponse): Promise<any> {
    resp.setHeader('Access-Control-Allow-Origin', '*');
    resp.setHeader('Access-Control-Expose-Headers', '*');
    resp.setHeader('Access-Control-Allow-Credentials', 'true');
    resp.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    this.logger.log(headers);

    const axiosHeaders = new AxiosHeaders(headers);
    axiosHeaders.delete('host');
    axiosHeaders.delete('connection');
    axiosHeaders.delete('content-length');

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
    @GenericResponse() resp: GenericResponse
  ): Promise<any> {
    resp.setHeader('Access-Control-Allow-Origin', '*');
    resp.setHeader('Access-Control-Expose-Headers', '*');
    resp.setHeader('Access-Control-Allow-Credentials', 'true');
    resp.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
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
  async getOrder(@Headers() headers, @GenericResponse() resp: GenericResponse): Promise<any> {
    resp.setHeader('Access-Control-Allow-Origin', '*');
    resp.setHeader('Access-Control-Expose-Headers', '*');
    resp.setHeader('Access-Control-Allow-Credentials', 'true');
    resp.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    this.logger.log(headers);

    const axiosHeaders = new AxiosHeaders(headers);
    axiosHeaders.delete('host');
    axiosHeaders.delete('connection');
    axiosHeaders.delete('content-length');

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
    @GenericResponse() resp: GenericResponse
  ): Promise<any> {
    resp.setHeader('Access-Control-Allow-Origin', '*');
    resp.setHeader('Access-Control-Expose-Headers', '*');
    resp.setHeader('Access-Control-Allow-Credentials', 'true');
    resp.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    this.logger.log(headers);
    this.logger.log(body);

    const axiosHeaders = new AxiosHeaders(headers);
    axiosHeaders.delete('host');
    axiosHeaders.delete('connection');
    axiosHeaders.delete('content-length');

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
