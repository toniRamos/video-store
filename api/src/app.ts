import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Video store',
      version: '1.0.0',
      description: 'API for video store',
    },
    servers: [
      {
        url: 'http://localhost:' + PORT,
      },
    ],
    components: {
      securitySchemes: {
        // bearerAuth: {
        //   type: 'http',
        //   scheme: 'bearer',
        //   bearerFormat: 'JWT',
        // },
      },
    },
  },
  apis: ['./src/application/routes/*.ts', './src/application/app.ts'],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🎉 Look Video store!! and more boring stuff -> Server is running on port ${PORT}`);
  console.log(`📍 Access the API at: http://localhost:${PORT}`);
});

export default app;