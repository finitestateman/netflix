import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // dto에 정의되지 않은 프로퍼티를 무시, 기본값: false
            forbidNonWhitelisted: true, // 무시하지 않고 에러 발생
            // forbidUnknownValues: true // Validates whether the payload matches the expected DTO type or shape at all
            transformOptions: {
                // boolean에 대해 값이 존재하기만 하면 true라서 주의가 필요하다('false'나 ' '가 true로 변환된다)
                enableImplicitConversion: true,
            },
        }),
    );
    app.enableCors({
        origin: 'http://localhost:5173',
        credentials: true,
    });
    await app.listen(process.env.PORT ?? 3000);
}
// void 연산자
void bootstrap();
