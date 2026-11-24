# Reliable Order Management System

A full-stack Order Management System built using the MERN stack, with Redis caching and Docker-based infrastructure. The application supports complete order management, persistent MongoDB storage, cache invalidation, and automatic fallback when Redis is unavailable.

## Features

- Create, view, update, and delete orders.
- React-based responsive dashboard.
- RESTful API built with Node.js and Express.
- MongoDB persistence using Mongoose.
- Redis caching with a 60-second TTL.
- Automatic cache invalidation after create, update, and delete operations.
- MongoDB fallback when Redis is unavailable.
- Automatic Redis reconnection.
- Support for multiple backend instances.
- Input validation and centralized error handling.
- Docker Compose for MongoDB and Redis services.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend |
| JavaScript | Application logic |
| Node.js | Backend runtime |
| Express.js | REST API |
| MongoDB | Database |
| Mongoose | ODM |
| Redis | Caching |
| Axios | API requests |
| Docker | Infrastructure |
| Docker Compose | Service management |

## Project Structure

```text
order-management-system/
│
├── client/
│   └── src/
│       ├── components/
│       │   ├── OrderForm.jsx
│       │   └── EditOrderForm.jsx
│       ├── services/
│       │   └── orderService.js
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   ├── controllers/
│   │   └── orderController.js
│   ├── models/
│   │   └── Order.js
│   ├── routes/
│   │   └── orderRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── ai-logs/
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Prerequisites

Install the following:

- Node.js and npm
- Docker Desktop
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd order-management-system
```

### 2. Start MongoDB and Redis

From the project root:

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

### 3. Configure the backend

Navigate to the server directory:

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/order_management
REDIS_URL=redis://localhost:6379
```

### 4. Start the backend

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 5. Configure and start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL displayed in your terminal, normally:

`http://localhost:5173`

## API Endpoints

Base URL: `http://localhost:5000/api/orders`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Create an order |
| GET | `/api/orders` | Retrieve all orders |
| GET | `/api/orders/:id` | Retrieve one order |
| PUT | `/api/orders/:id` | Update an order |
| DELETE | `/api/orders/:id` | Delete an order |

### Order Data Model

```json
{
  "customerName": "Rahul Sharma",
  "productName": "Laptop",
  "quantity": 2,
  "price": 45000,
  "status": "pending"
}
```

Supported statuses:

- pending
- processing
- completed
- cancelled

Each order also includes automatically generated `_id`, `createdAt`, and `updatedAt` fields.

## Redis Caching Strategy

The application uses Redis to improve the performance of order retrieval.

**Cache workflow:**

1. Check Redis for cached orders.
2. If cached data exists, return it.
3. If the cache is empty or Redis is unavailable, retrieve orders from MongoDB.
4. Store retrieved orders in Redis with a 60-second TTL when Redis is available.
5. Invalidate the cache after successful create, update, or delete operations.

### Redis Failure Handling

The application is designed to continue operating when Redis becomes unavailable.

- GET requests fall back to MongoDB.
- Create, update, and delete operations continue using MongoDB.
- Redis reconnection is attempted automatically.
- Cached order data becomes available again after Redis reconnects and the cache is populated.

## Multiple Backend Instances

The backend can run on multiple ports while sharing the same MongoDB database and Redis instance.

Example PowerShell command for a second instance:

```powershell
$env:PORT=5001
node server.js
```

The first instance runs on port `5000`, and the second runs on port `5001`.

## Testing

The following scenarios were tested during development:

- Order creation and retrieval.
- Individual order retrieval.
- Order updates and deletion.
- Invalid input and invalid order IDs.
- MongoDB persistence after backend restart.
- Redis cache hits and cache invalidation.
- GET requests when Redis is unavailable.
- Order creation when Redis is unavailable.
- Automatic Redis reconnection.
- Shared data access across multiple backend instances.

## Stopping Services

Stop the Node.js processes using `Ctrl + C`.

Stop Docker services from the project root:

```bash
docker compose down
```

To remove the MongoDB persistent volume as well (this deletes stored database data):

```bash
docker compose down -v
```

## AI Assistance

AI tools were used during development for implementation guidance, debugging, code review, and testing support.

Relevant conversation logs are maintained in the `ai-logs/` directory.