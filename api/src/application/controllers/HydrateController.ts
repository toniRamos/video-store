import { Request, Response } from 'express';
import { FilmService } from '../services/FilmService';
import { UserService } from '../services/UserService';

export class HydrateController {
  private filmService: FilmService;
  private userService: UserService;

  constructor(filmService: FilmService, userService: UserService) {
    this.filmService = filmService;
    this.userService = userService;
  }

  /**
   * @swagger
   * /hydrate:
   *   post:
   *     summary: Hydrate database with sample data
   *     description: Populates the database with sample films and users for testing purposes
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
   *                 data:
   *                   type: object
   *                   properties:
   *                     filmsCreated:
   *                       type: number
   *                     usersCreated:
   *                       type: number
   *       500:
   *         description: Internal server error
   */
  async hydrate(req: Request, res: Response): Promise<void> {
    try {
      const sampleFilms = this.getSampleFilms();
      const sampleUsers = this.getSampleUsers();

      // Clear existing data (optional - remove if you want to keep existing data)
      console.log('🗑️  Clearing existing data...');
      
      // Create or update films
      console.log('🎬 Creating/updating sample films...');
      let filmsCreated = 0;
      let filmsUpdated = 0;
      for (const filmData of sampleFilms) {
        try {
          const result = await this.filmService.upsertFilm(filmData);
          if (result.wasCreated) {
            filmsCreated++;
            console.log(`✅ Created new film: "${filmData.title}"`);
          } else {
            filmsUpdated++;
            console.log(`🔄 Updated existing film: "${filmData.title}"`);
          }
        } catch (error) {
          console.log(`❌ Error processing film "${filmData.title}":`, error);
        }
      }

      // Create users
      console.log('👥 Creating sample users...');
      let usersCreated = 0;
      for (const userData of sampleUsers) {
        try {
          await this.userService.createUser(userData);
          usersCreated++;
        } catch (error) {
          console.log(`⚠️  User "${userData.email}" might already exist, skipping...`);
        }
      }

      console.log('✅ Database hydration completed!');

      res.status(200).json({
        message: 'Database hydrated successfully',
        data: {
          filmsCreated,
          filmsUpdated,
          usersCreated,
          totalSampleFilms: sampleFilms.length,
          totalSampleUsers: sampleUsers.length
        }
      });
    } catch (error) {
      console.error('❌ Error hydrating database:', error);
      res.status(500).json({
        message: 'Error hydrating database',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getSampleFilms() {
    return [
      {
        title: 'The Shawshank Redemption',
        director: 'Frank Darabont',
        releaseYear: 1994,
        genre: 'Drama',
        duration: 142,
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        price: 4.99,
        available: true
      },
      {
        title: 'The Godfather',
        director: 'Francis Ford Coppola',
        releaseYear: 1972,
        genre: 'Crime',
        duration: 175,
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        price: 5.99,
        available: true
      },
      {
        title: 'The Dark Knight',
        director: 'Christopher Nolan',
        releaseYear: 2008,
        genre: 'Action',
        duration: 152,
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
        price: 4.99,
        available: true
      },
      {
        title: 'Pulp Fiction',
        director: 'Quentin Tarantino',
        releaseYear: 1994,
        genre: 'Crime',
        duration: 154,
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
        price: 4.99,
        available: true
      },
      {
        title: "Schindler's List",
        director: 'Steven Spielberg',
        releaseYear: 1993,
        genre: 'Biography',
        duration: 195,
        description: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce.',
        price: 5.99,
        available: true
      },
      {
        title: 'The Lord of the Rings: The Return of the King',
        director: 'Peter Jackson',
        releaseYear: 2003,
        genre: 'Adventure',
        duration: 201,
        description: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom.",
        price: 6.99,
        available: true
      },
      {
        title: 'Forrest Gump',
        director: 'Robert Zemeckis',
        releaseYear: 1994,
        genre: 'Comedy',
        duration: 142,
        description: 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.',
        price: 4.99,
        available: true
      },
      {
        title: 'Inception',
        director: 'Christopher Nolan',
        releaseYear: 2010,
        genre: 'Sci-Fi',
        duration: 148,
        description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into a CEO.',
        price: 4.99,
        available: true
      },
      {
        title: 'The Matrix',
        director: 'Lana Wachowski',
        releaseYear: 1999,
        genre: 'Sci-Fi',
        duration: 136,
        description: 'A computer programmer is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.',
        price: 3.99,
        available: true
      },
      {
        title: 'Goodfellas',
        director: 'Martin Scorsese',
        releaseYear: 1990,
        genre: 'Biography',
        duration: 146,
        description: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.',
        price: 4.99,
        available: true
      },
      {
        title: 'Interstellar',
        director: 'Christopher Nolan',
        releaseYear: 2014,
        genre: 'Adventure',
        duration: 169,
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        price: 5.99,
        available: true
      },
      {
        title: 'Parasite',
        director: 'Bong Joon-ho',
        releaseYear: 2019,
        genre: 'Thriller',
        duration: 132,
        description: 'A poor family schemes to become employed by a wealthy family by infiltrating their household and posing as unrelated individuals.',
        price: 4.99,
        available: true
      },
      {
        title: 'The Lion King',
        director: 'Roger Allers',
        releaseYear: 1994,
        genre: 'Animation',
        duration: 88,
        description: 'Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.',
        price: 3.99,
        available: true
      },
      {
        title: 'Avengers: Endgame',
        director: 'Anthony Russo',
        releaseYear: 2019,
        genre: 'Action',
        duration: 181,
        description: 'After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos actions and restore balance.',
        price: 6.99,
        available: false
      },
      {
        title: 'Joker',
        director: 'Todd Phillips',
        releaseYear: 2019,
        genre: 'Crime',
        duration: 122,
        description: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society.',
        price: 4.99,
        available: true
      }
    ];
  }

  private getSampleUsers() {
    return [
      {
        personalIdentifier: '12345678A',
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@email.com',
        phone: '+34 612 345 678',
        address: 'Calle Gran Vía 45',
        city: 'Madrid',
        postalCode: '28013',
        country: 'España',
        dateOfBirth: new Date('1985-03-15'),
        membershipType: 'premium',
        active: true
      },
      {
        personalIdentifier: '23456789B',
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+34 623 456 789',
        address: 'Avenida Diagonal 123',
        city: 'Barcelona',
        postalCode: '08008',
        country: 'España',
        dateOfBirth: new Date('1990-07-22'),
        membershipType: 'standard',
        active: true
      },
      {
        personalIdentifier: '34567890C',
        firstName: 'María',
        lastName: 'López',
        email: 'maria.lopez@email.com',
        phone: '+34 634 567 890',
        address: 'Plaza del Ayuntamiento 12',
        city: 'Valencia',
        postalCode: '46002',
        country: 'España',
        dateOfBirth: new Date('1988-11-08'),
        membershipType: 'premium',
        active: true
      },
      {
        personalIdentifier: '45678901D',
        firstName: 'David',
        lastName: 'Martinez',
        email: 'david.martinez@email.com',
        phone: '+34 645 678 901',
        address: 'Calle Sierpes 78',
        city: 'Sevilla',
        postalCode: '41004',
        country: 'España',
        dateOfBirth: new Date('1992-01-30'),
        membershipType: 'basic',
        active: true
      },
      {
        personalIdentifier: '56789012E',
        firstName: 'Laura',
        lastName: 'Sánchez',
        email: 'laura.sanchez@email.com',
        phone: '+34 656 789 012',
        address: 'Rambla de los Estudios 34',
        city: 'Barcelona',
        postalCode: '08002',
        country: 'España',
        dateOfBirth: new Date('1986-09-18'),
        membershipType: 'standard',
        active: true
      },
      {
        personalIdentifier: '67890123F',
        firstName: 'Javier',
        lastName: 'Fernández',
        email: 'javier.fernandez@email.com',
        phone: '+34 667 890 123',
        address: 'Calle de Alcalá 200',
        city: 'Madrid',
        postalCode: '28028',
        country: 'España',
        dateOfBirth: new Date('1991-05-12'),
        membershipType: 'premium',
        active: true
      },
      {
        personalIdentifier: '78901234G',
        firstName: 'Isabel',
        lastName: 'Ruiz',
        email: 'isabel.ruiz@email.com',
        phone: '+34 678 901 234',
        address: 'Avenida de la Constitución 89',
        city: 'Sevilla',
        postalCode: '41001',
        country: 'España',
        dateOfBirth: new Date('1989-12-03'),
        membershipType: 'basic',
        active: true
      },
      {
        personalIdentifier: '89012345H',
        firstName: 'Roberto',
        lastName: 'Jiménez',
        email: 'roberto.jimenez@email.com',
        phone: '+34 689 012 345',
        address: 'Plaza de la Virgen 5',
        city: 'Valencia',
        postalCode: '46001',
        country: 'España',
        dateOfBirth: new Date('1987-04-25'),
        membershipType: 'standard',
        active: true
      },
      {
        personalIdentifier: '90123456I',
        firstName: 'Carmen',
        lastName: 'Morales',
        email: 'carmen.morales@email.com',
        phone: '+34 690 123 456',
        address: 'Paseo de Gracia 67',
        city: 'Barcelona',
        postalCode: '08007',
        country: 'España',
        dateOfBirth: new Date('1993-08-14'),
        membershipType: 'premium',
        active: true
      },
      {
        personalIdentifier: '01234567J',
        firstName: 'Antonio',
        lastName: 'Herrera',
        email: 'antonio.herrera@email.com',
        phone: '+34 601 234 567',
        address: 'Calle de la Montera 33',
        city: 'Madrid',
        postalCode: '28013',
        country: 'España',
        dateOfBirth: new Date('1984-02-28'),
        membershipType: 'basic',
        active: false
      },
      {
        personalIdentifier: '11223344K',
        firstName: 'Elena',
        lastName: 'Vargas',
        email: 'elena.vargas@email.com',
        phone: '+34 612 345 789',
        address: 'Calle Betis 56',
        city: 'Sevilla',
        postalCode: '41010',
        country: 'España',
        dateOfBirth: new Date('1990-10-07'),
        membershipType: 'standard',
        active: true
      },
      {
        personalIdentifier: '22334455L',
        firstName: 'Miguel',
        lastName: 'Santos',
        email: 'miguel.santos@email.com',
        phone: '+34 623 456 890',
        address: 'Avenida del Puerto 125',
        city: 'Valencia',
        postalCode: '46024',
        country: 'España',
        dateOfBirth: new Date('1988-06-16'),
        membershipType: 'premium',
        active: true
      }
    ];
  }
}
