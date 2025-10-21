import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { ProjectModule } from './modules/project/project.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { StrategyModule } from './modules/strategy/strategy.module';
import { ContentModule } from './modules/content/content.module';
import { ChannelModule } from './modules/channel/channel.module';
import { MetricsModule } from './modules/metrics/metrics.module';

@Module({
  imports: [
    // 환경 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 이벤트 시스템
    EventEmitterModule.forRoot(),

    // 큐 시스템
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
    }),

    // 비즈니스 모듈
    ProjectModule,
    AnalysisModule,
    StrategyModule,
    ContentModule,
    ChannelModule,
    MetricsModule,
  ],
})
export class AppModule {}
