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
        }),
    );
    await app.listen(process.env.PORT ?? 3000);
}
// void 연산자
void bootstrap();
