import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify'
import compression from '@fastify/compress'
import fastifyCsrf from '@fastify/csrf-protection'
import helmet from '@fastify/helmet'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )
  await app.register(compression)
  await app.register(fastifyCsrf)
  await app.register(helmet)
  app.enableCors()
  await app.listen(3000, '192.168.0.10')
}
bootstrap()
