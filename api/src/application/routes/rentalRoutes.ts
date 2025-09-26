import { Router } from 'express';
import { RentalController } from '../controllers/RentalController';
import { RentalService } from '../services/RentalService';
import { MongoRentalRepository } from '../../infrastructure/repositories/MongoRentalRepository';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository';
import { MongoFilmRepository } from '../../infrastructure/repositories/MongoFilmRepository';

// Dependency injection setup
const rentalRepository = new MongoRentalRepository();
const userRepository = new MongoUserRepository();
const filmRepository = new MongoFilmRepository();
const rentalService = new RentalService(rentalRepository, userRepository, filmRepository);
const rentalController = new RentalController(rentalService);

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Rental:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the rental
 *         userId:
 *           type: string
 *           description: ID of the user who rented the film
 *         filmId:
 *           type: string
 *           description: ID of the rented film
 *         rentalDate:
 *           type: string
 *           format: date-time
 *           description: Date when the film was rented
 *         expectedReturnDate:
 *           type: string
 *           format: date-time
 *           description: Expected return date
 *         actualReturnDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Actual return date (null if not returned)
 *         status:
 *           type: string
 *           enum: [ACTIVE, RETURNED, OVERDUE]
 *           description: Current status of the rental
 *         rentalPrice:
 *           type: number
 *           description: Price paid for the rental
 *         lateFee:
 *           type: number
 *           description: Late fee charged (if any)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the rental record was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the rental record was last updated
 * 
 *     CreateRentalRequest:
 *       type: object
 *       required:
 *         - userId
 *         - filmId
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user renting the film
 *         filmId:
 *           type: string
 *           description: ID of the film to rent
 *         rentalPeriodDays:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *           default: 7
 *           description: Number of days for the rental period
 * 
 *     RentalAnalytics:
 *       type: object
 *       properties:
 *         totalActiveRentals:
 *           type: integer
 *         totalReturnedRentals:
 *           type: integer
 *         totalOverdueRentals:
 *           type: integer
 *         totalRevenue:
 *           type: number
 *         averageRentalDuration:
 *           type: number
 *         mostRentedFilms:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               filmId:
 *                 type: string
 *               title:
 *                 type: string
 *               count:
 *                 type: integer
 *         mostActiveUsers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               userName:
 *                 type: string
 *               count:
 *                 type: integer
 */

// Specific routes first (to avoid conflicts with /:id)
// Get overdue rentals
router.get('/overdue', rentalController.getOverdueRentals.bind(rentalController));

// Get rental analytics
router.get('/analytics', rentalController.getAnalytics.bind(rentalController));

// Check rental eligibility
router.post('/check-eligibility', rentalController.checkRentalEligibility.bind(rentalController));

// Get user rentals
router.get('/users/:userId', rentalController.getUserRentals.bind(rentalController));

// Get film rental history
router.get('/films/:filmId', rentalController.getFilmRentals.bind(rentalController));

// Create a new rental
router.post('/', rentalController.createRental.bind(rentalController));

// Search/list rentals
router.get('/', rentalController.searchRentals.bind(rentalController));

// Get specific rental by ID
router.get('/:id', rentalController.getRentalById.bind(rentalController));

// Return a rental
router.put('/:id/return', rentalController.returnRental.bind(rentalController));

// Extend rental period
router.put('/:id/extend', rentalController.extendRental.bind(rentalController));

export { router as rentalRoutes };
