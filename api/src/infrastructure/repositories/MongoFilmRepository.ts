import { Collection, ObjectId } from 'mongodb';
import { Film } from '../../domain/entities/Film';
import { FilmRepository } from '../../domain/repositories/FilmRepository';
import { MongoConnection } from '../database/MongoConnection';

interface FilmDocument {
  _id?: ObjectId;
  id: string;
  title: string;
  director: string;
  releaseYear: number;
  genre: string;
  duration: number;
  description: string;
  available: boolean;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoFilmRepository implements FilmRepository {
  private readonly collectionName = 'films';
  private mongoConnection: MongoConnection;

  constructor() {
    this.mongoConnection = MongoConnection.getInstance();
  }

  private getCollection(): Collection<FilmDocument> {
    const db = this.mongoConnection.getDatabase();
    return db.collection<FilmDocument>(this.collectionName);
  }

  private filmToDocument(film: Film): FilmDocument {
    return {
      id: film.id,
      title: film.title,
      director: film.director,
      releaseYear: film.releaseYear,
      genre: film.genre,
      duration: film.duration,
      description: film.description,
      available: film.available,
      price: film.price,
      createdAt: film.createdAt,
      updatedAt: film.updatedAt
    };
  }

  private documentToFilm(document: FilmDocument): Film {
    return new Film(
      document.id,
      document.title,
      document.director,
      document.releaseYear,
      document.genre,
      document.duration,
      document.description,
      document.available,
      document.price,
      document.createdAt,
      document.updatedAt
    );
  }

  async save(film: Film): Promise<Film> {
    try {
      const collection = this.getCollection();
      const document = this.filmToDocument(film);
      
      await collection.insertOne(document);
      return film;
    } catch (error) {
      throw new Error(`Error saving film: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private normalizeText(text: string): string {
    return text
      .trim()                          // Remove leading/trailing spaces
      .toLowerCase()                   // Convert to lowercase
      .normalize('NFD')                // Decompose accents
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
      .replace(/\s+/g, ' ')           // Multiple spaces -> single space
      .replace(/[^\w\s]/g, '');       // Remove special characters except spaces
  }

  async upsert(film: Film): Promise<{ film: Film; wasCreated: boolean }> {
    try {
      const collection = this.getCollection();
      const document = this.filmToDocument(film);
      
      // Normalize search criteria for flexible comparison
      const normalizedTitle = this.normalizeText(film.title);
      const normalizedDirector = this.normalizeText(film.director);
      
      // Try to find existing film by normalized criteria
      const existingFilm = await collection.findOne({
        $expr: {
          $and: [
            { $eq: [{ $toLower: { $trim: { input: "$title" } } }, normalizedTitle] },
            { $eq: [{ $toLower: { $trim: { input: "$director" } } }, normalizedDirector] },
            { $eq: ["$releaseYear", film.releaseYear] }
          ]
        }
      });

      if (existingFilm) {
        // Update existing film
        const updatedDocument = {
          ...document,
          id: existingFilm.id, // Keep original ID
          createdAt: existingFilm.createdAt, // Keep original creation date
          updatedAt: new Date() // Update modification date
        };
        
        await collection.replaceOne(
          { id: existingFilm.id },
          updatedDocument
        );
        
        return {
          film: this.documentToFilm(updatedDocument),
          wasCreated: false
        };
      } else {
        // Create new film
        await collection.insertOne(document);
        return {
          film: film,
          wasCreated: true
        };
      }
    } catch (error) {
      throw new Error(`Error upserting film: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Film | null> {
    try {
      const collection = this.getCollection();
      const document = await collection.findOne({ id });
      
      return document ? this.documentToFilm(document) : null;
    } catch (error) {
      throw new Error(`Error finding film by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Film[]> {
    try {
      const collection = this.getCollection();
      const documents = await collection.find({}).toArray();
      
      return documents.map(doc => this.documentToFilm(doc));
    } catch (error) {
      throw new Error(`Error finding all films: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByTitle(title: string): Promise<Film[]> {
    try {
      const collection = this.getCollection();
      const documents = await collection.find({
        title: { $regex: title, $options: 'i' }
      }).toArray();
      
      return documents.map(doc => this.documentToFilm(doc));
    } catch (error) {
      throw new Error(`Error finding films by title: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByGenre(genre: string): Promise<Film[]> {
    try {
      const collection = this.getCollection();
      const documents = await collection.find({
        genre: { $regex: genre, $options: 'i' }
      }).toArray();
      
      return documents.map(doc => this.documentToFilm(doc));
    } catch (error) {
      throw new Error(`Error finding films by genre: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByDirector(director: string): Promise<Film[]> {
    try {
      const collection = this.getCollection();
      const documents = await collection.find({
        director: { $regex: director, $options: 'i' }
      }).toArray();
      
      return documents.map(doc => this.documentToFilm(doc));
    } catch (error) {
      throw new Error(`Error finding films by director: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByAvailability(available: boolean): Promise<Film[]> {
    try {
      const collection = this.getCollection();
      const documents = await collection.find({ available }).toArray();
      
      return documents.map(doc => this.documentToFilm(doc));
    } catch (error) {
      throw new Error(`Error finding films by availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(film: Film): Promise<Film> {
    try {
      const collection = this.getCollection();
      const document = this.filmToDocument(film);
      
      const result = await collection.updateOne(
        { id: film.id },
        { $set: document }
      );

      if (result.matchedCount === 0) {
        throw new Error('Film not found');
      }

      return film;
    } catch (error) {
      throw new Error(`Error updating film: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne({ id });
      
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Error deleting film: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const collection = this.getCollection();
      const count = await collection.countDocuments({ id });
      
      return count > 0;
    } catch (error) {
      throw new Error(`Error checking if film exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findPotentialDuplicates(title: string, director: string, releaseYear: number): Promise<Film[]> {
    try {
      const collection = this.getCollection();
      const normalizedTitle = this.normalizeText(title);
      const normalizedDirector = this.normalizeText(director);
      
      // Find films with similar title, director and same year
      const documents = await collection.find({
        $and: [
          {
            $expr: {
              $eq: [{ $toLower: { $trim: { input: "$title" } } }, normalizedTitle]
            }
          },
          {
            $expr: {
              $eq: [{ $toLower: { $trim: { input: "$director" } } }, normalizedDirector]
            }
          },
          { releaseYear: releaseYear }
        ]
      }).toArray();
      
      return documents.map(doc => this.documentToFilm(doc));
    } catch (error) {
      throw new Error(`Error finding potential duplicates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createIndexes(): Promise<void> {
    try {
      const collection = this.getCollection();
      
      // Create indexes for efficient queries (removed unique constraint to handle it in app logic)
      await collection.createIndex({ title: 1, director: 1, releaseYear: 1 }, { name: 'film_identifier_index' });
      await collection.createIndex({ genre: 1 });
      await collection.createIndex({ director: 1 });
      await collection.createIndex({ available: 1 });
      
      console.log('✅ Film collection indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating film collection indexes:', error);
    }
  }
}
