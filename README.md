# Video Store

Personal video club project to demonstrate Domain-Driven Design (DDD) and Event Sourcing.

## Description

This application consists of:
- A frontend in Node.js (likely using React or similar) for managing and viewing the video club.
- A backend API in Node.js with Express, structured following DDD and Event Sourcing principles.
- MongoDB database for event and projection persistence.
- Redis for caching or messaging.
- Service orchestration with Docker Compose.

## Services

- **frontend**: User interface, exposed on port 3000.
- **api**: RESTful API, exposed on port 3001, connects to MongoDB and Redis.
- **db**: MongoDB, main data and event store.
- **redis**: Cache/messaging service.

## How to Run the Project

1. Make sure you have Docker and Docker Compose installed.
2. Give execution permissions to the backend entrypoint:
   ```bash
   chmod +x ./api/entrypoint.sh
   ```
3. Start the services:
   ```./start.sh
   ```
4. The frontend will be available at http://localhost:3000 and the API at http://localhost:3001

## Applied Principles

- **Domain-Driven Design (DDD)**: The backend is structured into domains, aggregates, entities, repositories, and domain services.
- **Event Sourcing**: State changes are stored as immutable events in MongoDB.

## Notes

- This project is experimental and serves as a demonstration of best practices in software architecture.
- You can modify and adapt the code as needed.

---

Explore the code and experiment with DDD and Event Sourcing in Node.js!
