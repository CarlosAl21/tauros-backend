import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

type OpenApiSchema = Record<string, any>;
type OpenApiDocument = Record<string, any>;

function resolveRef(schema: OpenApiSchema | undefined, document: OpenApiDocument): OpenApiSchema {
  if (!schema) return {};

  if (schema.$ref && typeof schema.$ref === 'string') {
    const refParts = schema.$ref.split('/');
    const schemaName = refParts[refParts.length - 1];
    return document.components?.schemas?.[schemaName] ?? {};
  }

  return schema;
}

function exampleByFormat(format?: string): unknown {
  if (format === 'uuid') return '550e8400-e29b-41d4-a716-446655440000';
  if (format === 'email') return 'usuario@taurosgym.com';
  if (format === 'date-time') return new Date().toISOString();
  if (format === 'date') return '2026-01-15';
  return undefined;
}

function buildExample(schema: OpenApiSchema | undefined, document: OpenApiDocument): unknown {
  const resolved = resolveRef(schema, document);

  if (resolved.example !== undefined) {
    return resolved.example;
  }

  if (resolved.enum?.length) {
    return resolved.enum[0];
  }

  if (resolved.oneOf?.length) {
    return buildExample(resolved.oneOf[0], document);
  }

  if (resolved.anyOf?.length) {
    return buildExample(resolved.anyOf[0], document);
  }

  if (resolved.allOf?.length) {
    const merged = resolved.allOf
      .map((part: OpenApiSchema) => buildExample(part, document))
      .filter((item: unknown) => typeof item === 'object' && item !== null)
      .reduce((acc: Record<string, unknown>, curr: unknown) => ({ ...acc, ...(curr as Record<string, unknown>) }), {});
    return Object.keys(merged).length ? merged : undefined;
  }

  if (resolved.type === 'array') {
    return [buildExample(resolved.items, document) ?? 'item'];
  }

  if (resolved.type === 'object' || resolved.properties) {
    const result: Record<string, unknown> = {};
    const properties = resolved.properties ?? {};

    for (const [key, propertySchema] of Object.entries(properties)) {
      const property = propertySchema as OpenApiSchema;
      if (property.example !== undefined) {
        result[key] = property.example;
        continue;
      }

      if (key.toLowerCase().includes('password')) {
        result[key] = 'Tauros123*';
        continue;
      }

      if (key.toLowerCase().includes('correo') || key.toLowerCase().includes('email')) {
        result[key] = 'usuario@taurosgym.com';
        continue;
      }

      if (key.toLowerCase().includes('cedula')) {
        result[key] = '0102030405';
        continue;
      }

      if (key.toLowerCase().includes('telefono')) {
        result[key] = '0999999999';
        continue;
      }

      if (key.toLowerCase().includes('link') || key.toLowerCase().includes('url')) {
        result[key] = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
        continue;
      }

      const built = buildExample(property, document);
      result[key] = built ?? 'valor';
    }

    return result;
  }

  if (resolved.type === 'string') {
    return exampleByFormat(resolved.format) ?? 'texto';
  }

  if (resolved.type === 'integer' || resolved.type === 'number') {
    return 1;
  }

  if (resolved.type === 'boolean') {
    return true;
  }

  return undefined;
}

function defaultParamExample(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('id')) return '550e8400-e29b-41d4-a716-446655440000';
  if (lower.includes('cedula')) return '0102030405';
  return 'valor';
}

function applyExamplesToOperation(operation: Record<string, any>, document: OpenApiDocument): void {
  const requestBodyContent = operation.requestBody?.content;
  if (requestBodyContent) {
    for (const contentType of Object.keys(requestBodyContent)) {
      const schema = requestBodyContent[contentType]?.schema;
      const example = buildExample(schema, document);
      if (example !== undefined && requestBodyContent[contentType].example === undefined) {
        requestBodyContent[contentType].example = example;
      }
    }
  }

  if (Array.isArray(operation.parameters)) {
    for (const parameter of operation.parameters) {
      if (parameter.example === undefined) {
        parameter.example = defaultParamExample(parameter.name ?? 'param');
      }
    }
  }

  const responseStatuses = ['200', '201'];
  for (const status of responseStatuses) {
    const responseContent = operation.responses?.[status]?.content;
    if (!responseContent) continue;

    for (const contentType of Object.keys(responseContent)) {
      const response = responseContent[contentType];
      if (response?.example !== undefined) continue;
      const example = buildExample(response?.schema, document);
      if (example !== undefined) {
        response.example = example;
      }
    }
  }
}

function applySwaggerExamples(document: OpenApiDocument): void {
  for (const pathValue of Object.values(document.paths ?? {})) {
    const pathItem = pathValue as Record<string, any>;
    for (const method of ['get', 'post', 'patch', 'put', 'delete']) {
      if (!pathItem[method]) continue;
      applyExamplesToOperation(pathItem[method], document);
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Habilitar CORS
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tauros Backend API')
    .setDescription('Documentacion de endpoints del sistema TaurosGym')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  applySwaggerExamples(swaggerDocument as OpenApiDocument);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`📚 Swagger disponible en: http://localhost:${port}/docs`);
}
bootstrap();
