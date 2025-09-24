import { Request, Response } from 'express';
import { UserService, CreateUserRequest, UpdateUserRequest } from '../services/UserService';

export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: Create a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - personalIdentifier
   *               - firstName
   *               - lastName
   *               - email
   *               - phone
   *               - address
   *               - city
   *               - postalCode
   *               - country
   *               - dateOfBirth
   *             properties:
   *               personalIdentifier:
   *                 type: string
   *                 description: DNI, NIE, Passport, etc.
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               phone:
   *                 type: string
   *               address:
   *                 type: string
   *               city:
   *                 type: string
   *               postalCode:
   *                 type: string
   *               country:
   *                 type: string
   *               dateOfBirth:
   *                 type: string
   *                 format: date
   *               membershipType:
   *                 type: string
   *                 enum: [standard, premium, vip]
   *                 default: standard
   *               active:
   *                 type: boolean
   *                 default: true
   *     responses:
   *       201:
   *         description: User created successfully
   *       400:
   *         description: Invalid input data
   *       409:
   *         description: User already exists
   *       500:
   *         description: Internal server error
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const createUserRequest: CreateUserRequest = {
        personalIdentifier: req.body.personalIdentifier,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        postalCode: req.body.postalCode,
        country: req.body.country,
        dateOfBirth: new Date(req.body.dateOfBirth),
        membershipType: req.body.membershipType,
        active: req.body.active
      };

      const user = await this.userService.createUser(createUserRequest);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user.toJSON()
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({
            success: false,
            message: error.message,
            data: null
          });
        } else {
          res.status(400).json({
            success: false,
            message: error.message,
            data: null
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          data: null
        });
      }
    }
  };

  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Get all users
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: List of all users
   *       500:
   *         description: Internal server error
   */
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users.map(user => user.toJSON())
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  };

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Get user by ID
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The user ID
   *     responses:
   *       200:
   *         description: User found
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  };

  /**
   * @swagger
   * /api/users/personal-identifier/{personalIdentifier}:
   *   get:
   *     summary: Get user by personal identifier
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: personalIdentifier
   *         required: true
   *         schema:
   *           type: string
   *         description: The user personal identifier (DNI, NIE, etc.)
   *     responses:
   *       200:
   *         description: User found
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  getUserByPersonalIdentifier = async (req: Request, res: Response): Promise<void> => {
    try {
      const { personalIdentifier } = req.params;
      const user = await this.userService.getUserByPersonalIdentifier(personalIdentifier);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  };

  /**
   * @swagger
   * /api/users/email/{email}:
   *   get:
   *     summary: Get user by email
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: email
   *         required: true
   *         schema:
   *           type: string
   *           format: email
   *         description: The user email
   *     responses:
   *       200:
   *         description: User found
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  getUserByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.params;
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  };

  /**
   * @swagger
   * /api/users/search/name:
   *   get:
   *     summary: Search users by name
   *     tags: [Users]
   *     parameters:
   *       - in: query
   *         name: firstName
   *         required: true
   *         schema:
   *           type: string
   *         description: First name to search for
   *       - in: query
   *         name: lastName
   *         schema:
   *           type: string
   *         description: Last name to search for (optional)
   *     responses:
   *       200:
   *         description: Users found
   *       400:
   *         description: Invalid parameters
   *       500:
   *         description: Internal server error
   */
  getUsersByName = async (req: Request, res: Response): Promise<void> => {
    try {
      const { firstName, lastName } = req.query;
      
      if (!firstName) {
        res.status(400).json({
          success: false,
          message: 'First name is required',
          data: null
        });
        return;
      }

      const users = await this.userService.getUsersByName(firstName as string, lastName as string);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users.map(user => user.toJSON())
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  };

  /**
   * @swagger
   * /api/users/city/{city}:
   *   get:
   *     summary: Get users by city
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: city
   *         required: true
   *         schema:
   *           type: string
   *         description: The city name
   *     responses:
   *       200:
   *         description: Users found
   *       500:
   *         description: Internal server error
   */
  getUsersByCity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { city } = req.params;
      const users = await this.userService.getUsersByCity(city);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users.map(user => user.toJSON())
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  };

  /**
   * @swagger
   * /api/users/membership/{membershipType}:
   *   get:
   *     summary: Get users by membership type
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: membershipType
   *         required: true
   *         schema:
   *           type: string
   *           enum: [standard, premium, vip]
   *         description: The membership type
   *     responses:
   *       200:
   *         description: Users found
   *       400:
   *         description: Invalid membership type
   *       500:
   *         description: Internal server error
   */
  getUsersByMembershipType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { membershipType } = req.params;
      const users = await this.userService.getUsersByMembershipType(membershipType);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users.map(user => user.toJSON())
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  };

  /**
   * @swagger
   * /api/users/active:
   *   get:
   *     summary: Get active users
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: Active users found
   *       500:
   *         description: Internal server error
   */
  getActiveUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getActiveUsers();

      res.status(200).json({
        success: true,
        message: 'Active users retrieved successfully',
        data: users.map(user => user.toJSON())
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: null
      });
    }
  };

  /**
   * @swagger
   * /api/users/{id}:
   *   put:
   *     summary: Update user
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The user ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               personalIdentifier:
   *                 type: string
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               phone:
   *                 type: string
   *               address:
   *                 type: string
   *               city:
   *                 type: string
   *               postalCode:
   *                 type: string
   *               country:
   *                 type: string
   *               dateOfBirth:
   *                 type: string
   *                 format: date
   *               membershipType:
   *                 type: string
   *                 enum: [standard, premium, vip]
   *               active:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: User updated successfully
   *       400:
   *         description: Invalid input data
   *       404:
   *         description: User not found
   *       409:
   *         description: Conflict (email or personal identifier already exists)
   *       500:
   *         description: Internal server error
   */
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateUserRequest: UpdateUserRequest = { ...req.body };
      
      if (updateUserRequest.dateOfBirth) {
        updateUserRequest.dateOfBirth = new Date(updateUserRequest.dateOfBirth);
      }

      const user = await this.userService.updateUser(id, updateUserRequest);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user.toJSON()
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({
            success: false,
            message: error.message,
            data: null
          });
        } else if (error.message.includes('already exists')) {
          res.status(409).json({
            success: false,
            message: error.message,
            data: null
          });
        } else {
          res.status(400).json({
            success: false,
            message: error.message,
            data: null
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          data: null
        });
      }
    }
  };

  /**
   * @swagger
   * /api/users/{id}/status:
   *   patch:
   *     summary: Update user status
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The user ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - active
   *             properties:
   *               active:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: User status updated successfully
   *       400:
   *         description: Invalid input data
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { active } = req.body;

      if (typeof active !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'Active status must be a boolean value',
          data: null
        });
        return;
      }

      const user = await this.userService.updateUserStatus(id, active);

      res.status(200).json({
        success: true,
        message: 'User status updated successfully',
        data: user.toJSON()
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          success: false,
          message: error.message,
          data: null
        });
      } else {
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Internal server error',
          data: null
        });
      }
    }
  };

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Delete user
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The user ID
   *     responses:
   *       200:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.userService.deleteUser(id);

      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'User deleted successfully',
          data: null
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          success: false,
          message: error.message,
          data: null
        });
      } else {
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Internal server error',
          data: null
        });
      }
    }
  };
}
