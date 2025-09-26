import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import filmRoutes from './application/routes/filmRoutes';
import userRoutes from './application/routes/userRoutes';
import hydrateRoutes from './application/routes/hydrateRoutes';
import { historyRoutes } from './application/routes/historyRoutes';
import { rentalRoutes } from './application/routes/rentalRoutes';
import { MongoConnection } from './infrastructure/database/MongoConnection';
import { MongoFilmRepository } from './infrastructure/repositories/MongoFilmRepository';
import { MongoUserRepository } from './infrastructure/repositories/MongoUserRepository';
import { MongoRentalRepository } from './infrastructure/repositories/MongoRentalRepository';

const app = express();
const PORT = process.env.PORT || 3000;
const SWAGGER_HOST_PORT = process.env.SWAGGER_HOST_PORT || PORT;

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
        url: 'http://localhost:' + SWAGGER_HOST_PORT,
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
  apis: ['./src/application/routes/*.ts', './src/application/controllers/*.ts'],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Film routes
app.use('/api/films', filmRoutes);

// User routes
app.use('/api/users', userRoutes);

// Rental routes
app.use('/api/rentals', rentalRoutes);

// History routes
app.use('/api/history', historyRoutes);

// Hydrate routes
app.use('/api/hydrate', hydrateRoutes);

// Initialize MongoDB connection and start server
async function startServer() {
  try {
    // Connect to MongoDB
    const mongoConnection = MongoConnection.getInstance();
    await mongoConnection.connect();
    
    // Create indexes for better performance
    const filmRepository = new MongoFilmRepository();
    await filmRepository.createIndexes();
    
    const userRepository = new MongoUserRepository();
    await userRepository.createIndexes();
    
    const rentalRepository = new MongoRentalRepository();
    // Indexes are created automatically on first access
    
    app.listen(PORT, () => {
      console.log(`🎉 Look Video store!! and more boring stuff -> Server is running on port ${PORT}`);
      console.log(`📍 Access the API at: http://localhost:${SWAGGER_HOST_PORT}`);
      console.log(`📚 API Documentation at: http://localhost:${SWAGGER_HOST_PORT}/api-docs`);
      console.log(`🎬 Films API at: http://localhost:${SWAGGER_HOST_PORT}/api/films`);
      console.log(`👥 Users API at: http://localhost:${SWAGGER_HOST_PORT}/api/users`);
      console.log(`🎭 Rentals API at: http://localhost:${SWAGGER_HOST_PORT}/api/rentals`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    const mongoConnection = MongoConnection.getInstance();
    await mongoConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();

export default app;