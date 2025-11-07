import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
  });
  app.enableShutdownHooks();

  await app.init();

  console.log('🚀 Application initialized successfully');

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    await app.close();
    process.exit(0);
  };

  process.once('SIGINT', () => {
    shutdown('SIGINT').catch((err) => {
      console.error('Error during shutdown:', err);
      process.exit(1);
    });
  });
  process.once('SIGTERM', () => {
    shutdown('SIGTERM').catch((err) => {
      console.error('Error during shutdown:', err);
      process.exit(1);
    });
  });
}
void bootstrap();
