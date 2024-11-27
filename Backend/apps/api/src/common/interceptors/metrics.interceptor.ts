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

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metricsEnabled = this.configService.get<boolean>('METRICS_ENABLED') || true;

    if (!metricsEnabled) {
      return next.handle();
    }

    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        // 메트릭 데이터 생성
        const metricData = {
          cw_key: this.configService.get<string>('NCLOUD_CW_KEY'),
          dimensions: {
            path: url,
            method: method,
          },
          metrics: [
            {
              metric: 'api_response_time',
              value: responseTime,
              timestamp: Date.now(),
            },
            {
              metric: 'api_request_count',
              value: 1,
              timestamp: Date.now(),
            },
          ],
        };
        // 비동기적으로 메트릭 전송
        this.sendMetric(metricData);
      }),
    );
  }

  private async sendMetric(metricData: any) {
    try {
      await axios.post(
        this.configService.get<string>('NCLOUD_API_ENDPOINT'), // .env에 설정한 엔드포인트 URL 사용
        metricData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-ncp-apigw-api-key': this.configService.get<string>('NCLOUD_API_KEY'),
          },
        },
      );
    } catch (error) {
      console.error('Metric send error:', error);
      // 메트릭 전송 실패 시 애플리케이션 동작에 영향을 주지 않도록 처리
    }
  }
}
