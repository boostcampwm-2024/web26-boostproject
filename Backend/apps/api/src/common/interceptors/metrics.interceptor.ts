import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metricsEnabled = this.configService.get<boolean>('METRICS_ENABLED') ?? true;

    if (!metricsEnabled) {
      return next.handle();
    }

    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;

        // ID Dimension 및 추가 Dimension 값 설정
        const path = this.extractPath(url);

        // 메트릭 데이터 생성
        const metricData = {
          metricList: [
            {
              productName: this.configService.get<string>('NCLOUD_PRODUCT_NAME'),
              metric: 'api_response_time',
              dimensions: {
                path: path,
                method: method,
              },
              values: [
                {
                  timestamp: Date.now(),
                  value: responseTime,
                },
              ],
            },
            {
              productName: this.configService.get<string>('NCLOUD_PRODUCT_NAME'),
              metric: 'api_request_count',
              dimensions: {
                path: path,
                method: method,
              },
              values: [
                {
                  timestamp: Date.now(),
                  value: 1,
                },
              ],
            },
          ],
        };

        // 비동기적으로 메트릭 전송
        this.sendMetric(metricData).catch((error) => {
          console.error('Metric send error:', error);
        });
      }),
    );
  }

  private extractPath(url: string): string {
    try {
      const parsedUrl = new URL(url, `http://${process.env.HOSTNAME || 'localhost'}`);
      return parsedUrl.pathname;
    } catch (error) {
      console.error('URL parsing error:', error);
      return '/unknown';
    }
  }

  private async sendMetric(metricData: any) {
    try {
      const accessKey = this.configService.get<string>('NCLOUD_ACCESS_KEY');
      const secretKey = this.configService.get<string>('NCLOUD_SECRET_KEY');
      const timestamp = Date.now().toString();
      const method = 'POST';
      const uri = '/cw_server/real/cw/api/data';

      const signature = this.makeSignature(method, uri, timestamp, accessKey, secretKey);

      await axios.post(
        `https://cw.apigw.ntruss.com${uri}`,
        metricData,
        {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'x-ncp-apigw-timestamp': timestamp,
            'x-ncp-iam-access-key': accessKey,
            'x-ncp-apigw-signature-v2': signature,
          },
        },
      );
    } catch (error) {
      console.error('Error sending metrics:', error);
      // 메트릭 전송 실패 시 애플리케이션 동작에 영향을 주지 않도록 처리
    }
  }

  private makeSignature(method: string, url: string, timestamp: string, accessKey: string, secretKey: string): string {
    const space = ' ';
    const newLine = '\n';
    const message = method + space + url + newLine + timestamp + newLine + accessKey;
    const hmac = crypto.createHmac('sha256', secretKey);
    return hmac.update(message).digest('base64');
  }
}
