import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify'
import compression from '@fastify/compress'
import fastifyCsrf from '@fastify/csrf-protection'
import helmet from '@fastify/helmet'
import { Logger } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )

  await app.register(compression)
  await app.register(fastifyCsrf)
  await app.register(helmet)

  app.enableCors()

  const port = process.env.PORT || 3000
  const host = process.env.HOST || '0.0.0.0'

  await app.init()

  app.listen({ host: host, port: 3000 }, (err) => {
    if (err) {
      Logger.error('Error starting the application', err)
      process.exit(1)
    }
    Logger.log(`Application is running on: http://${host}:${port}`)
  })
}

bootstrap()
