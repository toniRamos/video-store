import { Router } from 'express';
import { HydrateController } from '../controllers/HydrateController';
import { FilmService } from '../services/FilmService';
import { UserService } from '../services/UserService';
import { MongoFilmRepository } from '../../infrastructure/repositories/MongoFilmRepository';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository';

const router = Router();

// Initialize repositories
const filmRepository = new MongoFilmRepository();
const userRepository = new MongoUserRepository();

// Initialize services
const filmService = new FilmService(filmRepository);
const userService = new UserService(userRepository);

// Initialize controller
const hydrateController = new HydrateController(filmService, userService);

/**
 * @swagger
 * tags:
 *   name: Hydrate
 *   description: Database hydration endpoints for development and testing
 */

/**
 * @swagger
 * /hydrate:
 *   post:
 *     summary: Hydrate database with sample data
 *     description: |
 *       Populates the database with sample films and users for testing and development purposes.
 *       
 *       **Sample Data Includes:**
 *       - 15 popular films with realistic details (title, director, year, genre, etc.)
 *       - 12 users from different Spanish cities with various membership types
 *       
 *       **Behavior:**
 *       - Skips records that already exist (based on unique constraints)
 *       - Returns count of successfully created records
 *       - Safe to run multiple times
 *     tags: [Hydrate]
 *     responses:
 *       200:
 *         description: Database hydrated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Database hydrated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     filmsCreated:
 *                       type: number
 *                       example: 15
 *                       description: Number of films successfully created
 *                     usersCreated:
 *                       type: number
 *                       example: 12
 *                       description: Number of users successfully created
 *                     totalSampleFilms:
 *                       type: number
 *                       example: 15
 *                       description: Total number of sample films attempted
 *                     totalSampleUsers:
 *                       type: number
 *                       example: 12
 *                       description: Total number of sample users attempted
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error hydrating database"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
router.post('/', hydrateController.hydrate.bind(hydrateController));

export default router;
