import { Request, Response } from 'express';
import { FilmService, CreateFilmRequest, UpdateFilmRequest } from '../services/FilmService';

export class FilmController {
  constructor(private readonly filmService: FilmService) {}

  /**
   * @swagger
   * /api/films:
   *   post:
   *     summary: Create a new film
   *     tags: [Films]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - director
   *               - releaseYear
   *               - genre
   *               - duration
   *               - description
   *               - price
   *             properties:
   *               title:
   *                 type: string
   *               director:
   *                 type: string
   *               releaseYear:
   *                 type: number
   *               genre:
   *                 type: string
   *               duration:
   *                 type: number
   *               description:
   *                 type: string
   *               price:
   *                 type: number
   *               available:
   *                 type: boolean
   *                 default: true
   *     responses:
   *       201:
   *         description: Film created successfully
   *       400:
   *         description: Invalid input data
   *       500:
   *         description: Internal server error
   */
  async createFilm(req: Request, res: Response): Promise<void> {
    try {
      const createFilmRequest: CreateFilmRequest = req.body;
      const film = await this.filmService.createFilm(createFilmRequest);
      res.status(201).json({
        success: true,
        data: film.toJSON(),
        message: 'Film created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * @swagger
   * /api/films:
   *   get:
   *     summary: Get all films
   *     tags: [Films]
   *     parameters:
   *       - in: query
   *         name: genre
   *         schema:
   *           type: string
   *         description: Filter by genre
   *       - in: query
   *         name: director
   *         schema:
   *           type: string
   *         description: Filter by director
   *       - in: query
   *         name: available
   *         schema:
   *           type: boolean
   *         description: Filter by availability
   *     responses:
   *       200:
   *         description: List of films
   *       500:
   *         description: Internal server error
   */
  async getAllFilms(req: Request, res: Response): Promise<void> {
    try {
      const { genre, director, available } = req.query;
      
      let films;
      
      if (genre) {
        films = await this.filmService.getFilmsByGenre(genre as string);
      } else if (director) {
        films = await this.filmService.getFilmsByDirector(director as string);
      } else if (available !== undefined) {
        films = await this.filmService.getAvailableFilms();
      } else {
        films = await this.filmService.getAllFilms();
      }

      res.status(200).json({
        success: true,
        data: films.map(film => film.toJSON()),
        count: films.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * @swagger
   * /api/films/{id}:
   *   get:
   *     summary: Get film by ID
   *     tags: [Films]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Film ID
   *     responses:
   *       200:
   *         description: Film found
   *       404:
   *         description: Film not found
   *       500:
   *         description: Internal server error
   */
  async getFilmById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const film = await this.filmService.getFilmById(id);
      
      if (!film) {
        res.status(404).json({
          success: false,
          message: 'Film not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: film.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * @swagger
   * /api/films/{id}:
   *   put:
   *     summary: Update film
   *     tags: [Films]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Film ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               director:
   *                 type: string
   *               releaseYear:
   *                 type: number
   *               genre:
   *                 type: string
   *               duration:
   *                 type: number
   *               description:
   *                 type: string
   *               price:
   *                 type: number
   *               available:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Film updated successfully
   *       404:
   *         description: Film not found
   *       400:
   *         description: Invalid input data
   *       500:
   *         description: Internal server error
   */
  async updateFilm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateRequest: UpdateFilmRequest = req.body;
      
      const updatedFilm = await this.filmService.updateFilm(id, updateRequest);
      
      res.status(200).json({
        success: true,
        data: updatedFilm.toJSON(),
        message: 'Film updated successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Film not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * @swagger
   * /api/films/{id}:
   *   delete:
   *     summary: Delete film
   *     tags: [Films]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Film ID
   *     responses:
   *       200:
   *         description: Film deleted successfully
   *       404:
   *         description: Film not found
   *       500:
   *         description: Internal server error
   */
  async deleteFilm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.filmService.deleteFilm(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Film not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Film deleted successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Film not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * @swagger
   * /api/films/{id}/toggle-availability:
   *   patch:
   *     summary: Toggle film availability
   *     tags: [Films]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Film ID
   *     responses:
   *       200:
   *         description: Film availability toggled successfully
   *       404:
   *         description: Film not found
   *       500:
   *         description: Internal server error
   */
  async toggleAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedFilm = await this.filmService.toggleFilmAvailability(id);
      
      res.status(200).json({
        success: true,
        data: updatedFilm.toJSON(),
        message: 'Film availability toggled successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Film not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * @swagger
   * /api/films/{id}/price:
   *   patch:
   *     summary: Update film price
   *     tags: [Films]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Film ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - price
   *             properties:
   *               price:
   *                 type: number
   *                 minimum: 0
   *     responses:
   *       200:
   *         description: Film price updated successfully
   *       404:
   *         description: Film not found
   *       400:
   *         description: Invalid price
   *       500:
   *         description: Internal server error
   */
  async updatePrice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { price } = req.body;
      
      if (typeof price !== 'number' || price < 0) {
        res.status(400).json({
          success: false,
          message: 'Price must be a valid non-negative number'
        });
        return;
      }
      
      const updatedFilm = await this.filmService.updateFilmPrice(id, price);
      
      res.status(200).json({
        success: true,
        data: updatedFilm.toJSON(),
        message: 'Film price updated successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Film not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}
