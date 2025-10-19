# Wellbeing Data API with Cloudflare D1

This module provides a complete Express.js API for managing user wellbeing data using Cloudflare D1 as the database. The API handles daily wellbeing measurements including overall wellbeing, sleep quality, physical activity, social time, diet quality, and stress levels.

## Features

- ✅ Express.js server with middleware (CORS, Helmet, Morgan)
- ✅ Cloudflare D1 database integration
- ✅ TypeScript support with proper type definitions
- ✅ RESTful API endpoints for wellbeing data CRUD operations
- ✅ Batch data upload support for multiple days
- ✅ Input validation and error handling
- ✅ Pagination and filtering support
- ✅ Date range queries and analytics
- ✅ Database schema initialization

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your Cloudflare D1 credentials:

```bash
cp env.example .env
```

Update `.env` with your Cloudflare credentials:

```env
PORT=3000
NODE_ENV=development
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_D1_DATABASE_ID=your_database_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
```

### 3. Get Cloudflare D1 Credentials

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **D1 SQL Database**
3. Create a new database or use an existing one
4. Get your Account ID from the right sidebar
5. Get your Database ID from the database details
6. Create an API token with D1 permissions

### 4. Initialize Database Schema

Start the server and initialize the database schema:

```bash
npm run dev
```

Then make a POST request to initialize the schema:

```bash
curl -X POST http://localhost:3000/api/emotional-data/init
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Wellbeing Data Management

#### Create Single Wellbeing Data Entry
```http
POST /api/emotional-data
Content-Type: application/json

{
  "userId": "user123",
  "date": "2025-01-15",
  "overall_wellbeing": 8,
  "sleep_quality": 7,
  "physical_activity": 6,
  "time_with_family_friends": 8,
  "diet_quality": 7,
  "stress_levels": 3
}
```

#### Create Multiple Wellbeing Data Entries (Batch)
```http
POST /api/emotional-data/batch
Content-Type: application/json

{
  "userId": "user123",
  "wellbeingData": [
    {
      "date": "2025-01-14",
      "overall_wellbeing": 7,
      "sleep_quality": 8,
      "physical_activity": 6,
      "time_with_family_friends": 7,
      "diet_quality": 8,
      "stress_levels": 4
    },
    {
      "date": "2025-01-15",
      "overall_wellbeing": 6,
      "sleep_quality": 5,
      "physical_activity": 4,
      "time_with_family_friends": 6,
      "diet_quality": 7,
      "stress_levels": 6
    }
  ]
}
```

#### Get All Wellbeing Data
```http
GET /api/emotional-data?page=1&limit=10&userId=user123&startDate=2025-01-01&endDate=2025-12-31
```

#### Get Wellbeing Data by ID
```http
GET /api/emotional-data/{id}
```

#### Get Wellbeing Data by User ID
```http
GET /api/emotional-data/user/{userId}?page=1&limit=10&startDate=2025-01-01&endDate=2025-12-31
```

#### Get Wellbeing Data by User ID and Date Range
```http
GET /api/emotional-data/user/{userId}/range?startDate=2025-01-14&endDate=2025-01-18
```

#### Update Wellbeing Data
```http
PUT /api/emotional-data/{id}
Content-Type: application/json

{
  "overall_wellbeing": 9,
  "sleep_quality": 8,
  "stress_levels": 2
}
```

#### Delete Wellbeing Data
```http
DELETE /api/emotional-data/{id}
```

## Data Structure

### WellbeingData Interface
```typescript
interface WellbeingData {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  year: number;
  month: number;
  day: number;
  overall_wellbeing: number; // 1-10 scale
  sleep_quality: number; // 1-10 scale
  physical_activity: number; // 1-10 scale
  time_with_family_friends: number; // 1-10 scale
  diet_quality: number; // 1-10 scale
  stress_levels: number; // 1-10 scale (inverted - lower is better)
  createdAt?: string;
  updatedAt?: string;
}

interface WellbeingDataRequest {
  userId: string;
  date: string; // YYYY-MM-DD format
  overall_wellbeing: number;
  sleep_quality: number;
  physical_activity: number;
  time_with_family_friends: number;
  diet_quality: number;
  stress_levels: number;
}

interface WellbeingDataBatchRequest {
  userId: string;
  wellbeingData: WellbeingDataRequest[];
}
```

## Query Parameters

- `page` - Page number for pagination (default: 1)
- `limit` - Number of items per page (default: 10, max: 100)
- `userId` - Filter by user ID
- `startDate` - Filter by start date (ISO string)
- `endDate` - Filter by end date (ISO string)

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Additional context"
}
```

## Development

### Running the Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

## Database Schema

The wellbeing_data table structure:

```sql
CREATE TABLE wellbeing_data (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD format
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  day INTEGER NOT NULL,
  overall_wellbeing INTEGER NOT NULL CHECK (overall_wellbeing >= 1 AND overall_wellbeing <= 10),
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  physical_activity INTEGER NOT NULL CHECK (physical_activity >= 1 AND physical_activity <= 10),
  time_with_family_friends INTEGER NOT NULL CHECK (time_with_family_friends >= 1 AND time_with_family_friends <= 10),
  diet_quality INTEGER NOT NULL CHECK (diet_quality >= 1 AND diet_quality <= 10),
  stress_levels INTEGER NOT NULL CHECK (stress_levels >= 1 AND stress_levels <= 10),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, date)
);
```

## Security Features

- Input validation and sanitization
- CORS protection
- Helmet security headers
- Request logging with Morgan
- Error handling without sensitive data exposure

## Example Usage

### JavaScript/TypeScript Client
```typescript
// Create single wellbeing data entry
const response = await fetch('http://localhost:3000/api/emotional-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user123',
    date: '2025-01-15',
    overall_wellbeing: 8,
    sleep_quality: 7,
    physical_activity: 6,
    time_with_family_friends: 8,
    diet_quality: 7,
    stress_levels: 3
  })
});

const data = await response.json();
console.log(data);

// Create batch wellbeing data
const batchResponse = await fetch('http://localhost:3000/api/emotional-data/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user123',
    wellbeingData: [
      {
        date: '2025-01-14',
        overall_wellbeing: 7,
        sleep_quality: 8,
        physical_activity: 6,
        time_with_family_friends: 7,
        diet_quality: 8,
        stress_levels: 4
      },
      {
        date: '2025-01-15',
        overall_wellbeing: 6,
        sleep_quality: 5,
        physical_activity: 4,
        time_with_family_friends: 6,
        diet_quality: 7,
        stress_levels: 6
      }
    ]
  })
});
```

### cURL Examples
```bash
# Create single wellbeing data entry
curl -X POST http://localhost:3000/api/emotional-data \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "date": "2025-01-15",
    "overall_wellbeing": 8,
    "sleep_quality": 7,
    "physical_activity": 6,
    "time_with_family_friends": 8,
    "diet_quality": 7,
    "stress_levels": 3
  }'

# Create batch wellbeing data
curl -X POST http://localhost:3000/api/emotional-data/batch \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "wellbeingData": [
      {
        "date": "2025-01-14",
        "overall_wellbeing": 7,
        "sleep_quality": 8,
        "physical_activity": 6,
        "time_with_family_friends": 7,
        "diet_quality": 8,
        "stress_levels": 4
      }
    ]
  }'

# Get user's wellbeing data
curl "http://localhost:3000/api/emotional-data/user/user123?limit=5"

# Get wellbeing data by date range
curl "http://localhost:3000/api/emotional-data/user/user123/range?startDate=2025-01-14&endDate=2025-01-18"

# Get all wellbeing data with pagination
curl "http://localhost:3000/api/emotional-data?page=1&limit=10"
```
