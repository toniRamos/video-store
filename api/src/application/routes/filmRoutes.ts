import { Router } from 'express';
import { FilmController } from '../controllers/FilmController';
import { FilmService } from '../services/FilmService';
import { MongoFilmRepository } from '../../infrastructure/repositories/MongoFilmRepository';

// Dependency injection setup
const filmRepository = new MongoFilmRepository();
const filmService = new FilmService(filmRepository);
const filmController = new FilmController(filmService);

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Film:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - director
 *         - releaseYear
 *         - genre
 *         - duration
 *         - description
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the film
 *         title:
 *           type: string
 *           description: The title of the film
 *         director:
 *           type: string
 *           description: The director of the film
 *         releaseYear:
 *           type: number
 *           description: The year the film was released
 *         genre:
 *           type: string
 *           description: The genre of the film
 *         duration:
 *           type: number
 *           description: The duration of the film in minutes
 *         description:
 *           type: string
 *           description: A description of the film
 *         available:
 *           type: boolean
 *           description: Whether the film is available for rent
 *           default: true
 *         price:
 *           type: number
 *           description: The rental price of the film
 *         quantity:
 *           type: number
 *           description: Total number of copies in inventory
 *           default: 1
 *         availabilityQuantity:
 *           type: number
 *           description: Number of copies available for rental
 *         isAvailableForRental:
 *           type: boolean
 *           description: Whether the film has copies available for rental
 *         rentedQuantity:
 *           type: number
 *           description: Number of copies currently rented
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the film was added to the database
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the film was last updated
 *     CreateFilmRequest:
 *       type: object
 *       required:
 *         - title
 *         - director
 *         - releaseYear
 *         - genre
 *         - duration
 *         - description
 *         - price
 *       properties:
 *         title:
 *           type: string
 *         director:
 *           type: string
 *         releaseYear:
 *           type: number
 *           minimum: 1895
 *         genre:
 *           type: string
 *         duration:
 *           type: number
 *           minimum: 1
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           minimum: 0
 *         available:
 *           type: boolean
 *           default: true
 *     UpdateFilmRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         director:
 *           type: string
 *         releaseYear:
 *           type: number
 *           minimum: 1895
 *         genre:
 *           type: string
 *         duration:
 *           type: number
 *           minimum: 1
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           minimum: 0
 *         available:
 *           type: boolean
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         count:
 *           type: number
 */

/**
 * @swagger
 * tags:
 *   name: Films
 *   description: Film management endpoints
 */

// Create a new film
router.post('/', (req, res) => filmController.createFilm(req, res));

// Create or update film (prevents duplicates) - IMPORTANT: Must be before '/:id' routes
router.post('/upsert', (req, res) => filmController.upsertFilm(req, res));

// Check for potential duplicates - IMPORTANT: Must be before '/:id' routes
router.get('/check-duplicates', (req, res) => filmController.checkDuplicates(req, res));

// Get films available for rental - IMPORTANT: Must be before '/:id' routes
router.get('/available-for-rental', (req, res) => filmController.getFilmsAvailableForRental(req, res));

// Get all films (with optional filters)
router.get('/', (req, res) => filmController.getAllFilms(req, res));

// Get film by ID
router.get('/:id', (req, res) => filmController.getFilmById(req, res));

// Update film
router.put('/:id', (req, res) => filmController.updateFilm(req, res));

// Delete film
router.delete('/:id', (req, res) => filmController.deleteFilm(req, res));

// Toggle film availability
router.patch('/:id/toggle-availability', (req, res) => filmController.toggleAvailability(req, res));

// Update film price
router.patch('/:id/price', (req, res) => filmController.updatePrice(req, res));

// Update film inventory quantity
router.patch('/:id/quantity', (req, res) => filmController.updateFilmQuantity(req, res));

// Update film availability quantity
router.patch('/:id/availability-quantity', (req, res) => filmController.updateFilmAvailabilityQuantity(req, res));

export default router;
