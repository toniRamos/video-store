import { Router } from 'express';
import { UserHistoryController } from '../controllers/UserHistoryController';
import { UserService } from '../services/UserService';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository';
import { MongoUserAuditRepository } from '../../infrastructure/repositories/MongoUserAuditRepository';

// Dependency injection setup
const userRepository = new MongoUserRepository();
const auditRepository = new MongoUserAuditRepository();
const userService = new UserService(userRepository, auditRepository);
const userHistoryController = new UserHistoryController(userService);

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLogEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the audit log entry
 *         userId:
 *           type: string
 *           description: The ID of the user this audit log relates to
 *         action:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *           description: The type of action performed
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the action was performed
 *         changes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 description: The field that was changed
 *               oldValue:
 *                 description: The previous value
 *               newValue:
 *                 description: The new value
 *               dataType:
 *                 type: string
 *                 enum: [string, number, boolean, date, object]
 *         metadata:
 *           type: object
 *           properties:
 *             userAgent:
 *               type: string
 *             ipAddress:
 *               type: string
 *             performedBy:
 *               type: string
 *
 *     GlobalHistoryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             history:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuditLogEntry'
 *             totalCount:
 *               type: number
 *             limit:
 *               type: number
 *             offset:
 *               type: number
 *             hasMore:
 *               type: boolean
 *
 *     GlobalHistorySummary:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             totalEvents:
 *               type: number
 *             totalUsers:
 *               type: number
 *             actionCounts:
 *               type: object
 *               properties:
 *                 CREATE:
 *                   type: number
 *                 UPDATE:
 *                   type: number
 *                 DELETE:
 *                   type: number
 *             userSummaries:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   userName:
 *                     type: string
 *                   eventCount:
 *                     type: number
 *                   lastActivity:
 *                     type: string
 *                     format: date-time
 */

/**
 * @swagger
 * /history:
 *   get:
 *     summary: Get global audit history
 *     description: Retrieve audit history across all users in the system with pagination
 *     tags: [History]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Maximum number of records to return (default 10, max 100)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: offset
 *         required: false
 *         description: Number of records to skip (for pagination)
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Global audit history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GlobalHistoryResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/', userHistoryController.getGlobalHistory.bind(userHistoryController));

/**
 * @swagger
 * /history/summary:
 *   get:
 *     summary: Get global history summary
 *     description: Get summary statistics for all audit events across all users
 *     tags: [History]
 *     responses:
 *       200:
 *         description: Global history summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GlobalHistorySummary'
 *       500:
 *         description: Internal server error
 */
router.get('/summary', userHistoryController.getGlobalHistorySummary.bind(userHistoryController));

export { router as historyRoutes };
