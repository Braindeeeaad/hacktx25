# Database Seeding Scripts

This directory contains scripts to seed the D1 database with sample data.

## Scripts

### `seedDatabase.ts` / `seedDatabase.js`
Seeds the database with emotional wellbeing data for a specified user and date range. Defaults to user `g1@gmail.com` for September 17 - October 16, 2024.

## Usage

### Option 1: TypeScript (Recommended)
```bash
cd backend
npm run seed
```

### Option 2: JavaScript (After building)
```bash
cd backend
npm run build
npm run seed:js
```

### Option 3: Direct execution
```bash
cd backend
ts-node scripts/seedDatabase.ts
```

### Option 4: With custom parameters
```bash
cd backend
SEED_USER_ID="user@example.com" SEED_START_DATE="2024-01-01" SEED_END_DATE="2024-01-31" npm run seed
```

## Configuration

The script can be configured using environment variables:

- `SEED_USER_ID`: User ID to seed data for (default: `g1@gmail.com`)
- `SEED_START_DATE`: Start date in YYYY-MM-DD format (default: `2024-09-17`)
- `SEED_END_DATE`: End date in YYYY-MM-DD format (default: `2024-10-16`)

## What it does

1. **Initializes the database schema** (creates tables and indexes)
2. **Generates sample data** for the specified date range (default: 30 days)
3. **Creates realistic wellbeing data** with:
   - Overall wellbeing: 5-10 scale
   - Sleep quality: 5-9 scale  
   - Physical activity: 4-9 scale
   - Time with family/friends: 5-9 scale
   - Diet quality: 5-9 scale
   - Stress levels: 2-8 scale (lower is better)
4. **Inserts data in batches** to avoid API limits
5. **Verifies the data** was inserted correctly

## Sample Data Generated

The script generates realistic variations in wellbeing data:
- **Base scores** around 6-9 (generally positive)
- **Random variations** to simulate real user behavior
- **Configurable user ID** (default: `g1@gmail.com`)
- **Configurable date range** (default: 2024-09-17 to 2024-10-16)

## Output

The script will show:
- Progress of database initialization
- Batch insertion progress
- Final count of inserted records
- Verification of data with sample statistics
- Average wellbeing and sleep quality scores
