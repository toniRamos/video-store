# 🎬 Video Store

Modern video club management system with comprehensive user auditing and film catalog features. Built with Domain-Driven Design (DDD) principles and featuring a complete audit trail system.

## 🚀 Features

### 📽️ Film Management
- Complete CRUD operations for films
- Film catalog with detailed information (title, director, genre, year, etc.)
- Availability tracking and pricing management
- RESTful API with Swagger documentation

### 👥 User Management
- Comprehensive user management system
- Personal identification, contact details, and membership types
- User status management (active/inactive)
- Advanced search and filtering capabilities
- Modular React architecture with contextual navigation

### 📊 Audit System
- **Complete change tracking** for all user operations
- **Field-level auditing** with before/after values
- **Real-time history visualization** with expandable details
- **Global audit dashboard** with statistics and user summaries
- **Paginated audit logs** with advanced filtering
- **Interactive UI components** for audit exploration

### 🎨 Modern Frontend Architecture
- **Modular design** with domain-separated components
- **Responsive navigation** with contextual sub-headers
- **Real-time data updates** with optimized API integration
- **TypeScript** for type safety across the application

## 🏗️ Architecture

### Backend (API)
- **Node.js + Express + TypeScript**
- **Domain-Driven Design (DDD)** structure
- **MongoDB** for data persistence with optimized indexes
- **Comprehensive audit logging** with automatic change detection
- **RESTful API** with OpenAPI/Swagger documentation

### Frontend  
- **React 18 + TypeScript**
- **Modular architecture** by domain (films, users, shared)
- **Custom hooks** for API integration and state management
- **Responsive CSS** with modern design patterns
- **Component-based audit visualization**

### Infrastructure
- **Docker Compose** orchestration
- **MongoDB** with persistent volumes and TTL policies  
- **Redis** for caching and session management
- **Automated service health checks**

## 🐳 Services

- **frontend**: React application on port `3000`
- **api**: Express API server on port `3001` 
- **db**: MongoDB database on port `27017`
- **redis**: Redis cache on port `6379`

## 🚀 How to Run the Project

### Prerequisites
- **Docker** and **Docker Compose** installed on your system
- **Git** for cloning the repository
- At least **2GB RAM** available for containers

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd video-store
   ```

2. **Set executable permissions** (first time only):
   ```bash
   chmod +x ./start.sh ./api/entrypoint.sh
   ```

3. **Start all services**:
   ```bash
   ./start.sh
   ```
   
   This command will:
   - Build and start all Docker containers
   - Set up MongoDB with optimized indexes
   - Initialize the Redis cache
   - Start the frontend and backend services

4. **Access the application**:
   - 🌐 **Frontend**: http://localhost:3000
   - 🔧 **API**: http://localhost:3001  
   - 📚 **API Documentation**: http://localhost:3001/api-docs
   - 🏥 **Health Check**: http://localhost:3001/health

### 🔍 Service Status
Check if all services are running:
```bash
docker-compose ps
```

### 📊 Sample Data
To populate the system with sample data:
```bash
```bash
# Add sample films and users to database
curl -X POST http://localhost:3001/api/hydrate
```
```

### 🛠️ Development Commands
```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api
docker-compose logs -f frontend

# Restart a specific service
docker-compose restart api

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### 🗄️ Database Access
Connect to MongoDB directly:
```bash
# Access MongoDB shell
docker-compose exec db mongosh

# View audit logs
docker-compose exec db mongosh --eval "db.userauditlogs.find().limit(5).pretty()"
```

## 🏛️ Architecture Principles

### 🎯 Domain-Driven Design (DDD)
```
api/src/
├── application/          # Application layer
│   ├── controllers/      # HTTP request handlers  
│   ├── services/        # Application services
│   └── routes/          # API route definitions
├── domain/              # Domain layer
│   ├── entities/        # Business entities
│   └── repositories/    # Repository interfaces
└── infrastructure/      # Infrastructure layer
    ├── database/        # Database connections
    └── repositories/    # Repository implementations
```

### 📝 Audit System Architecture
- **UserAuditLog Entity**: Immutable audit records with field-level changes
- **Automatic Change Detection**: Compares old vs new values across all user operations  
- **MongoDB Optimization**: TTL indexes, efficient queries, and aggregation pipelines
- **Frontend Visualization**: Real-time audit displays with pagination and filtering

### ⚛️ Frontend Modular Architecture
```
frontend/src/
├── modules/
│   ├── films/           # Film management module
│   ├── users/           # User management module  
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components
│   │   ├── services/    # API integration
│   │   └── types/       # TypeScript definitions
│   └── shared/          # Shared utilities and hooks
└── styles/              # Global styling
```

## 🔍 API Endpoints

### 👤 User Management
- `GET /api/users` - List all users with filtering
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update user
- `PATCH /api/users/:id/status` - Toggle user status
- `DELETE /api/users/:id` - Delete user

### 📊 Audit System  
- `GET /api/users/:id/history` - Get user audit history
- `GET /api/users/:id/history/summary` - Get user audit summary
- `GET /api/history` - Global audit history (paginated)
- `GET /api/history/summary` - Global audit statistics

### 🎬 Film Management
- `GET /api/films` - List all films
- `POST /api/films` - Create new film
- `GET /api/films/:id` - Get film details  
- `PATCH /api/films/:id` - Update film
- `DELETE /api/films/:id` - Delete film

### 🌱 Data Seeding
- `POST /api/hydrate` - Create sample users and films

## 🎨 Frontend Features

### 🗂️ User Module Navigation
- **📋 Lista de Usuarios**: Complete user management with search and filters
- **👤 Crear Usuario**: User registration with validation
- **📚 Historial Global**: System-wide audit log with statistics

### 🔍 Audit Visualization
- **Individual Entry Cards**: Expandable audit entries with change details
- **Field-Level Changes**: Before/after values with proper formatting
- **Interactive Modals**: User history accessible from detail views
- **Global Dashboard**: Statistics, user summaries, and paginated logs
- **Real-time Updates**: Automatic refresh of audit data

## 🛡️ Quality Assurance

### 🔒 Data Integrity
- **TypeScript**: End-to-end type safety
- **Validation**: Input validation on both frontend and backend
- **Error Handling**: Comprehensive error states and user feedback
- **Audit Trails**: Complete change history for compliance

### 🚀 Performance
- **MongoDB Indexes**: Optimized queries for large datasets
- **Pagination**: Efficient data loading with configurable limits
- **Caching**: Redis integration for session management
- **Lazy Loading**: On-demand loading of audit data

## 🔧 Troubleshooting

### Common Issues

**Port conflicts**:
```bash
# Check what's using the ports
lsof -i :3000 -i :3001 -i :27017

# Kill processes if needed
pkill -f "node.*3000"
```

**Container issues**:
```bash  
# Rebuild containers
docker-compose build --no-cache

# Reset everything
docker-compose down -v
docker system prune -f
./start.sh
```

**Database connection issues**:
```bash
# Check MongoDB status
docker-compose exec db mongosh --eval "db.runCommand('ping')"

# Recreate database container
docker-compose stop db
docker-compose rm db  
docker-compose up db
```

## 🎯 Next Steps

- [ ] **Role-based permissions** for different user types
- [ ] **Film audit system** similar to user auditing  
- [ ] **Advanced reporting** with charts and analytics
- [ ] **Real-time notifications** for system events
- [ ] **Data export** functionality (CSV, PDF reports)
- [ ] **API rate limiting** and advanced security features

## 📄 License

This project is for educational and demonstration purposes. Feel free to explore, modify, and learn from the codebase.

---

🎬 **Built with passion for clean architecture and modern web development!**
