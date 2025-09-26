import { Request, Response } from 'express';
import { RentalService, CreateRentalRequest, ReturnRentalRequest, RentalSearchFilters } from '../services/RentalService';
import { RentalStatus } from '../../domain/entities/Rental';

export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  /**
   * @swagger
   * /api/rentals:
   *   post:
   *     summary: Create a new rental
   *     tags: [Rentals]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - filmId
   *             properties:
   *               userId:
   *                 type: string
   *                 description: ID of the user renting the film
   *               filmId:
   *                 type: string
   *                 description: ID of the film to rent
   *               rentalPeriodDays:
   *                 type: number
   *                 default: 7
   *                 minimum: 1
   *                 maximum: 30
   *                 description: Number of days for the rental period
   *     responses:
   *       201:
   *         description: Rental created successfully
   *       400:
   *         description: Bad request (invalid data, film not available, etc.)
   *       404:
   *         description: User or film not found
   *       409:
   *         description: Conflict (user already has active rental for this film)
   */
  async createRental(req: Request, res: Response): Promise<void> {
    try {
      const { userId, filmId, rentalPeriodDays } = req.body as CreateRentalRequest;

      if (!userId || !filmId) {
        res.status(400).json({
          message: 'User ID and Film ID are required',
        });
        return;
      }

      const rental = await this.rentalService.createRental({
        userId,
        filmId,
        rentalPeriodDays
      });

      res.status(201).json({
        message: 'Rental created successfully',
        data: rental
      });
    } catch (error) {
      console.error('❌ Error creating rental:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          message: errorMessage,
        });
      } else if (errorMessage.includes('already has') || errorMessage.includes('not available')) {
        res.status(409).json({
          message: errorMessage,
        });
      } else if (errorMessage.includes('Invalid')) {
        res.status(400).json({
          message: errorMessage,
        });
      } else {
        res.status(500).json({
          message: 'Failed to create rental',
          error: errorMessage
        });
      }
    }
  }

  /**
   * @swagger
   * /api/rentals/{id}/return:
   *   put:
   *     summary: Return a rented film
   *     tags: [Rentals]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Rental ID
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               returnDate:
   *                 type: string
   *                 format: date-time
   *                 description: Return date (defaults to current date)
   *     responses:
   *       200:
   *         description: Film returned successfully
   *       404:
   *         description: Rental not found
   *       400:
   *         description: Rental already returned
   */
  async returnRental(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { returnDate } = req.body as ReturnRentalRequest;

      const rental = await this.rentalService.returnRental({
        rentalId: id,
        returnDate: returnDate ? new Date(returnDate) : undefined
      });

      res.status(200).json({
        message: 'Film returned successfully',
        data: rental
      });
    } catch (error) {
      console.error('❌ Error returning rental:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          message: errorMessage,
        });
      } else if (errorMessage.includes('already returned')) {
        res.status(400).json({
          message: errorMessage,
        });
      } else {
        res.status(500).json({
          message: 'Failed to return rental',
          error: errorMessage
        });
      }
    }
  }

  /**
   * @swagger
   * /api/rentals/{id}:
   *   get:
   *     summary: Get rental by ID
   *     tags: [Rentals]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Rental ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Rental found
   *       404:
   *         description: Rental not found
   */
  async getRentalById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const rental = await this.rentalService.getRentalById(id);

      if (!rental) {
        res.status(404).json({
          message: 'Rental not found',
        });
        return;
      }

      res.status(200).json({
        message: 'Rental found',
        data: rental
      });
    } catch (error) {
      console.error('❌ Error getting rental:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      res.status(500).json({
        message: 'Failed to get rental',
        error: errorMessage
      });
    }
  }

  /**
   * @swagger
   * /api/rentals:
   *   get:
   *     summary: Search rentals
   *     tags: [Rentals]
   *     parameters:
   *       - in: query
   *         name: userId
   *         description: Filter by user ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: filmId
   *         description: Filter by film ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: status
   *         description: Filter by rental status
   *         schema:
   *           type: string
   *           enum: [ACTIVE, RETURNED, OVERDUE]
   *       - in: query
   *         name: limit
   *         description: Maximum number of results to return
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *       - in: query
   *         name: offset
   *         description: Number of results to skip
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *     responses:
   *       200:
   *         description: Rentals retrieved successfully
   */
  async searchRentals(req: Request, res: Response): Promise<void> {
    try {
      const { userId, filmId, status, limit = '50', offset = '0' } = req.query as any;

      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const offsetNum = Math.max(0, parseInt(offset));

      const filters: RentalSearchFilters = {};
      if (userId) filters.userId = userId;
      if (filmId) filters.filmId = filmId;
      if (status && Object.values(RentalStatus).includes(status as RentalStatus)) {
        filters.status = status as RentalStatus;
      }

      const rentals = await this.rentalService.searchRentals(filters, limitNum, offsetNum);

      res.status(200).json({
        message: 'Rentals retrieved successfully',
        data: {
          rentals,
          filters,
          limit: limitNum,
          offset: offsetNum,
          count: rentals.length
        }
      });
    } catch (error) {
      console.error('❌ Error searching rentals:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      res.status(500).json({
        message: 'Failed to search rentals',
        error: errorMessage
      });
    }
  }

  /**
   * @swagger
   * /api/rentals/users/{userId}:
   *   get:
   *     summary: Get user rentals
   *     tags: [Rentals]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         description: User ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: active
   *         description: Only return active rentals
   *         schema:
   *           type: boolean
   *       - in: query
   *         name: limit
   *         description: Maximum number of results
   *         schema:
   *           type: integer
   *           default: 50
   *       - in: query
   *         name: offset
   *         description: Number of results to skip
   *         schema:
   *           type: integer
   *           default: 0
   *     responses:
   *       200:
   *         description: User rentals retrieved successfully
   *       404:
   *         description: User not found
   */
  async getUserRentals(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { active = 'false', limit = '50', offset = '0' } = req.query as any;

      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const offsetNum = Math.max(0, parseInt(offset));
      const activeOnly = active === 'true';

      let rentals;
      if (activeOnly) {
        rentals = await this.rentalService.getUserActiveRentals(userId);
      } else {
        rentals = await this.rentalService.getUserRentals(userId, limitNum, offsetNum);
      }

      res.status(200).json({
        message: 'User rentals retrieved successfully',
        data: {
          userId,
          rentals,
          activeOnly,
          count: rentals.length
        }
      });
    } catch (error) {
      console.error('❌ Error getting user rentals:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          message: errorMessage,
        });
      } else {
        res.status(500).json({
          message: 'Failed to get user rentals',
          error: errorMessage
        });
      }
    }
  }

  /**
   * @swagger
   * /api/rentals/films/{filmId}:
   *   get:
   *     summary: Get film rental history
   *     tags: [Rentals]
   *     parameters:
   *       - in: path
   *         name: filmId
   *         required: true
   *         description: Film ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Maximum number of results
   *         schema:
   *           type: integer
   *           default: 50
   *       - in: query
   *         name: offset
   *         description: Number of results to skip
   *         schema:
   *           type: integer
   *           default: 0
   *     responses:
   *       200:
   *         description: Film rental history retrieved successfully
   *       404:
   *         description: Film not found
   */
  async getFilmRentals(req: Request, res: Response): Promise<void> {
    try {
      const { filmId } = req.params;
      const { limit = '50', offset = '0' } = req.query as any;

      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const offsetNum = Math.max(0, parseInt(offset));

      const rentals = await this.rentalService.getFilmRentals(filmId, limitNum, offsetNum);

      res.status(200).json({
        message: 'Film rental history retrieved successfully',
        data: {
          filmId,
          rentals,
          count: rentals.length
        }
      });
    } catch (error) {
      console.error('❌ Error getting film rentals:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          message: errorMessage,
        });
      } else {
        res.status(500).json({
          message: 'Failed to get film rentals',
          error: errorMessage
        });
      }
    }
  }

  /**
   * @swagger
   * /api/rentals/overdue:
   *   get:
   *     summary: Get overdue rentals
   *     tags: [Rentals]
   *     responses:
   *       200:
   *         description: Overdue rentals retrieved successfully
   */
  async getOverdueRentals(req: Request, res: Response): Promise<void> {
    try {
      const rentals = await this.rentalService.getOverdueRentals();

      res.status(200).json({
        message: 'Overdue rentals retrieved successfully',
        data: {
          rentals,
          count: rentals.length
        }
      });
    } catch (error) {
      console.error('❌ Error getting overdue rentals:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      res.status(500).json({
        message: 'Failed to get overdue rentals',
        error: errorMessage
      });
    }
  }

  /**
   * @swagger
   * /api/rentals/analytics:
   *   get:
   *     summary: Get rental analytics
   *     tags: [Rentals]
   *     responses:
   *       200:
   *         description: Analytics retrieved successfully
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.rentalService.getRentalAnalytics();

      res.status(200).json({
        message: 'Analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      console.error('❌ Error getting rental analytics:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      res.status(500).json({
        message: 'Failed to get rental analytics',
        error: errorMessage
      });
    }
  }

  /**
   * @swagger
   * /api/rentals/{id}/extend:
   *   put:
   *     summary: Extend rental period
   *     tags: [Rentals]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Rental ID
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - additionalDays
   *             properties:
   *               additionalDays:
   *                 type: number
   *                 minimum: 1
   *                 maximum: 14
   *                 description: Number of additional days
   *     responses:
   *       200:
   *         description: Rental extended successfully
   *       404:
   *         description: Rental not found
   *       400:
   *         description: Cannot extend rental (already returned, invalid days, etc.)
   */
  async extendRental(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { additionalDays } = req.body;

      if (!additionalDays || additionalDays <= 0) {
        res.status(400).json({
          message: 'Additional days must be a positive number',
        });
        return;
      }

      const rental = await this.rentalService.extendRental(id, additionalDays);

      res.status(200).json({
        message: 'Rental extended successfully',
        data: rental
      });
    } catch (error) {
      console.error('❌ Error extending rental:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          message: errorMessage,
        });
      } else if (errorMessage.includes('Cannot') || errorMessage.includes('must be')) {
        res.status(400).json({
          message: errorMessage,
        });
      } else {
        res.status(500).json({
          message: 'Failed to extend rental',
          error: errorMessage
        });
      }
    }
  }

  /**
   * @swagger
   * /api/rentals/check-eligibility:
   *   post:
   *     summary: Check if user can rent a specific film
   *     tags: [Rentals]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - filmId
   *             properties:
   *               userId:
   *                 type: string
   *               filmId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Eligibility check completed
   */
  async checkRentalEligibility(req: Request, res: Response): Promise<void> {
    try {
      const { userId, filmId } = req.body;

      if (!userId || !filmId) {
        res.status(400).json({
          message: 'User ID and Film ID are required',
        });
        return;
      }

      const eligibility = await this.rentalService.canUserRentFilm(userId, filmId);

      res.status(200).json({
        message: 'Eligibility check completed',
        data: eligibility
      });
    } catch (error) {
      console.error('❌ Error checking rental eligibility:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      res.status(500).json({
        message: 'Failed to check rental eligibility',
        error: errorMessage
      });
    }
  }
}
