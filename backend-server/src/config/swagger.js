import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HealthGuard API Documentation',
            version: '1.0.0',
            description: 'Tài liệu tích hợp API cho hệ thống Health Monitoring',
        },
        servers: [
            // { 
            //     url: 'http://localhost:3000/api/v1', 
            //     description: 'Môi trường Local' 
            // },
            { 
                url: 'https://healthguard-api-42q2.onrender.com/api/v1', 
                description: 'Môi trường Production' 
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/docs/*.yaml'], 
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('📄 Swagger Docs đang chạy tại: http://localhost:3000/api-docs');
};