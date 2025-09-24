import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

interface HistoryQueryParams {
  limit?: string;
  offset?: string;
  action?: 'CREATE' | 'UPDATE' | 'DELETE';
  startDate?: string;
  endDate?: string;
}

export class UserHistoryController {
  constructor(private userService: UserService) {}

  /**
   * @swagger
   * /users/{id}/history:
   *   get:
   *     summary: Get user audit history
   *     description: Retrieve the complete audit history for a specific user, showing all changes made over time
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: User ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         required: false
   *         description: Maximum number of records to return (default 50)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *       - in: query
   *         name: offset
   *         required: false
   *         description: Number of records to skip (for pagination)
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *       - in: query
   *         name: action
   *         required: false
   *         description: Filter by action type
   *         schema:
   *           type: string
   *           enum: [CREATE, UPDATE, DELETE]
   *     responses:
   *       200:
   *         description: User history retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "User history retrieved successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: string
   *                       example: "123e4567-e89b-12d3-a456-426614174000"
   *                     totalCount:
   *                       type: number
   *                       example: 15
   *                     limit:
   *                       type: number
   *                       example: 50
   *                     offset:
   *                       type: number
   *                       example: 0
   *                     history:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             example: "audit-123"
   *                           action:
   *                             type: string
   *                             enum: [CREATE, UPDATE, DELETE]
   *                             example: "UPDATE"
   *                           timestamp:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T10:30:00Z"
   *                           changesSummary:
   *                             type: string
   *                             example: "Campos modificados: firstName, email"
   *                           changes:
   *                             type: array
   *                             items:
   *                               type: object
   *                               properties:
   *                                 field:
   *                                   type: string
   *                                   example: "Nombre"
   *                                 fieldKey:
   *                                   type: string
   *                                   example: "firstName"
   *                                 oldValue:
   *                                   type: string
   *                                   example: "Juan"
   *                                 newValue:
   *                                   type: string
   *                                   example: "Juan Carlos"
   *                                 dataType:
   *                                   type: string
   *                                   enum: [string, number, boolean, date, object]
   *                           metadata:
   *                             type: object
   *                             properties:
   *                               userAgent:
   *                                 type: string
   *                               ipAddress:
   *                                 type: string
   *                               performedBy:
   *                                 type: string
   *       404:
   *         description: User not found
   *       400:
   *         description: Invalid parameters
   *       500:
   *         description: Internal server error
   */
  async getUserHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit = '50', offset = '0', action } = req.query as HistoryQueryParams;

      // Validate parameters
      const limitNum = parseInt(limit, 10);
      const offsetNum = parseInt(offset, 10);

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        res.status(400).json({
          message: 'Invalid limit parameter. Must be between 1 and 100.',
        });
        return;
      }

      if (isNaN(offsetNum) || offsetNum < 0) {
        res.status(400).json({
          message: 'Invalid offset parameter. Must be 0 or greater.',
        });
        return;
      }

      // Check if user exists
      const userExists = await this.userService.userExists(id);
      if (!userExists) {
        res.status(404).json({
          message: 'User not found',
        });
        return;
      }

      // Get audit history
      const history = await this.userService.getUserAuditHistory(id, limitNum, offsetNum);
      const totalCount = await this.userService.getUserAuditCount(id);

      // Filter by action if provided
      const filteredHistory = action 
        ? history.filter(entry => entry.action === action)
        : history;

      res.status(200).json({
        message: 'User history retrieved successfully',
        data: {
          userId: id,
          totalCount: action ? filteredHistory.length : totalCount,
          limit: limitNum,
          offset: offsetNum,
          filters: {
            action: action || null
          },
          history: filteredHistory
        }
      });
    } catch (error) {
      console.error('❌ Error retrieving user history:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          message: 'User not found',
        });
      } else if (errorMessage.includes('Invalid')) {
        res.status(400).json({
          message: errorMessage,
        });
      } else {
        res.status(500).json({
          message: 'Error retrieving user history',
          error: errorMessage
        });
      }
    }
  }

  /**
   * @swagger
   * /users/{id}/history/field/{fieldName}:
   *   get:
   *     summary: Get history of changes for a specific field
   *     description: Retrieve the history of changes for a specific field of a user
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: User ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: fieldName
   *         required: true
   *         description: Field name to get history for
   *         schema:
   *           type: string
   *           enum: [personalIdentifier, firstName, lastName, email, phone, address, city, postalCode, country, dateOfBirth, membershipType, active]
   *     responses:
   *       200:
   *         description: Field history retrieved successfully
   *       404:
   *         description: User not found
   *       400:
   *         description: Invalid field name
   *       500:
   *         description: Internal server error
   */
  async getFieldHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id, fieldName } = req.params;

      // Validate field name
      const validFields = [
        'personalIdentifier', 'firstName', 'lastName', 'email', 
        'phone', 'address', 'city', 'postalCode', 'country', 
        'dateOfBirth', 'membershipType', 'active'
      ];

      if (!validFields.includes(fieldName)) {
        res.status(400).json({
          message: `Invalid field name. Valid fields are: ${validFields.join(', ')}`,
        });
        return;
      }

      // Check if user exists
      const userExists = await this.userService.userExists(id);
      if (!userExists) {
        res.status(404).json({
          message: 'User not found',
        });
        return;
      }

      // Get field history
      const fieldHistory = await this.userService.getFieldHistory(id, fieldName);

      res.status(200).json({
        message: 'Field history retrieved successfully',
        data: {
          userId: id,
          fieldName: fieldName,
          changes: fieldHistory,
          totalChanges: fieldHistory.length
        }
      });
    } catch (error) {
      console.error('❌ Error retrieving field history:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      res.status(500).json({
        message: 'Error retrieving field history',
        error: errorMessage
      });
    }
  }

  /**
   * @swagger
   * /users/{id}/history/summary:
   *   get:
   *     summary: Get audit history summary
   *     description: Get a summary of audit events for a user (count by action type, recent activity, etc.)
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: User ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: History summary retrieved successfully
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  async getHistorySummary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if user exists
      const userExists = await this.userService.userExists(id);
      if (!userExists) {
        res.status(404).json({
          message: 'User not found',
        });
        return;
      }

      // Get recent history (last 10 events)
      const recentHistory = await this.userService.getUserAuditHistory(id, 10, 0);
      const totalCount = await this.userService.getUserAuditCount(id);

      // Count by action type
      const actionCounts = {
        CREATE: 0,
        UPDATE: 0,
        DELETE: 0
      };

      recentHistory.forEach(entry => {
        actionCounts[entry.action as keyof typeof actionCounts]++;
      });

      // Get last activity
      const lastActivity = recentHistory.length > 0 ? recentHistory[0] : null;

      res.status(200).json({
        message: 'History summary retrieved successfully',
        data: {
          userId: id,
          totalEvents: totalCount,
          actionCounts,
          lastActivity: lastActivity ? {
            action: lastActivity.action,
            timestamp: lastActivity.timestamp,
            changesSummary: lastActivity.changesSummary
          } : null,
          recentEvents: recentHistory.length,
          hasHistory: totalCount > 0
        }
      });
    } catch (error) {
      console.error('❌ Error retrieving history summary:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      res.status(500).json({
        message: 'Error retrieving history summary',
        error: errorMessage
      });
    }
  }
}
