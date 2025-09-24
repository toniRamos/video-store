import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserHistoryController } from '../controllers/UserHistoryController';
import { UserService } from '../services/UserService';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository';
import { MongoUserAuditRepository } from '../../infrastructure/repositories/MongoUserAuditRepository';

// Dependency injection setup
const userRepository = new MongoUserRepository();
const auditRepository = new MongoUserAuditRepository();
const userService = new UserService(userRepository, auditRepository);
const userController = new UserController(userService);
const userHistoryController = new UserHistoryController(userService);

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - personalIdentifier
 *         - firstName
 *         - lastName
 *         - email
 *         - phone
 *         - address
 *         - city
 *         - postalCode
 *         - country
 *         - dateOfBirth
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the user
 *         personalIdentifier:
 *           type: string
 *           description: Personal identification (DNI, NIE, Passport, etc.)
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *         fullName:
 *           type: string
 *           description: The full name of the user (computed)
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the user
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *         address:
 *           type: string
 *           description: The street address of the user
 *         city:
 *           type: string
 *           description: The city where the user lives
 *         postalCode:
 *           type: string
 *           description: The postal code of the user's address
 *         country:
 *           type: string
 *           description: The country where the user lives
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: The date of birth of the user
 *         age:
 *           type: number
 *           description: The age of the user (computed)
 *         active:
 *           type: boolean
 *           description: Whether the user account is active
 *         membershipType:
 *           type: string
 *           enum: [standard, premium, vip]
 *           description: The membership type of the user
 *         registrationDate:
 *           type: string
 *           format: date-time
 *           description: When the user registered
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user record was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user record was last updated
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - personalIdentifier
 *         - firstName
 *         - lastName
 *         - email
 *         - phone
 *         - address
 *         - city
 *         - postalCode
 *         - country
 *         - dateOfBirth
 *       properties:
 *         personalIdentifier:
 *           type: string
 *           description: Personal identification (DNI, NIE, Passport, etc.)
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the user
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *         address:
 *           type: string
 *           description: The street address of the user
 *         city:
 *           type: string
 *           description: The city where the user lives
 *         postalCode:
 *           type: string
 *           description: The postal code of the user's address
 *         country:
 *           type: string
 *           description: The country where the user lives
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: The date of birth of the user
 *         membershipType:
 *           type: string
 *           enum: [standard, premium, vip]
 *           default: standard
 *           description: The membership type of the user
 *         active:
 *           type: boolean
 *           default: true
 *           description: Whether the user account is active
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         personalIdentifier:
 *           type: string
 *           description: Personal identification (DNI, NIE, Passport, etc.)
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the user
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *         address:
 *           type: string
 *           description: The street address of the user
 *         city:
 *           type: string
 *           description: The city where the user lives
 *         postalCode:
 *           type: string
 *           description: The postal code of the user's address
 *         country:
 *           type: string
 *           description: The country where the user lives
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: The date of birth of the user
 *         membershipType:
 *           type: string
 *           enum: [standard, premium, vip]
 *           description: The membership type of the user
 *         active:
 *           type: boolean
 *           description: Whether the user account is active
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

// Create a new user
router.post('/', userController.createUser);

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Get user by personal identifier
router.get('/personal-identifier/:personalIdentifier', userController.getUserByPersonalIdentifier);

// Get user by email
router.get('/email/:email', userController.getUserByEmail);

// Search users by name
router.get('/search/name', userController.getUsersByName);

// Get users by city
router.get('/city/:city', userController.getUsersByCity);

// Get users by membership type
router.get('/membership/:membershipType', userController.getUsersByMembershipType);

// Get active users
router.get('/status/active', userController.getActiveUsers);

// Update user
router.put('/:id', userController.updateUser);

// Update user status
router.patch('/:id/status', userController.updateUserStatus);

// Delete user
router.delete('/:id', userController.deleteUser);

// ============ AUDIT/HISTORY ROUTES ============
/**
 * @swagger
 * tags:
 *   name: User History
 *   description: User audit and history management endpoints
 */

// Get user audit history
router.get('/:id/history', userHistoryController.getUserHistory.bind(userHistoryController));

// Get field-specific history
router.get('/:id/history/field/:fieldName', userHistoryController.getFieldHistory.bind(userHistoryController));

// Get history summary
router.get('/:id/history/summary', userHistoryController.getHistorySummary.bind(userHistoryController));

export default router;
