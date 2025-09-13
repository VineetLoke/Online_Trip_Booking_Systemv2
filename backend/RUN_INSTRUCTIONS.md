# How to Run the Data Management System in CMD

## Prerequisites

### 1. Install Node.js
- Download from: https://nodejs.org/
- Install the LTS version
- Verify installation: `node --version` and `npm --version`

### 2. Install MongoDB
- Download from: https://www.mongodb.com/try/download/community
- Install MongoDB Community Server
- Start MongoDB service

### 3. Navigate to Project Directory
Open Command Prompt (CMD) and navigate to your project:

```cmd
cd D:\Online_Trip_Booking_System\backend
```

## Step-by-Step Setup

### Step 1: Install Dependencies
```cmd
npm install
```

### Step 2: Setup Environment Configuration
```cmd
copy env.example .env
```

Edit the `.env` file with your preferred text editor:
```cmd
notepad .env
```

Update the configuration (optional - defaults will work):
```env
MONGODB_URI=mongodb://localhost:27017/online_booking_system
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

### Step 3: Start MongoDB Service
```cmd
net start MongoDB
```

If you get an error, try:
```cmd
mongod --dbpath "C:\data\db"
```

### Step 4: Run the Unified Data Manager

#### Complete Setup (Recommended for first time):
```cmd
node data_manager.js --action=setup
```

This will:
- Create all database collections and indexes
- Generate 1 week of sample data
- Create sample users
- Generate 20 sample bookings
- Create admin user

#### Other Useful Commands:

**Generate specific data:**
```cmd
node data_manager.js --action=generate --type=flights --days=7
node data_manager.js --action=generate --type=trains --days=14
node data_manager.js --action=generate --type=hotels
```

**Add sample bookings:**
```cmd
node data_manager.js --action=add-sample --count=50
```

**View database statistics:**
```cmd
node data_manager.js --action=stats
```

**Clear database (with confirmation):**
```cmd
node data_manager.js --action=clear
```

**Show help:**
```cmd
node data_manager.js --action=help
```

## Running the Backend Server

### Start the API Server:
```cmd
node server.js
```

The server will start on `http://localhost:3000` (or the port specified in your .env file).

## Running the Frontend

Open a new CMD window and navigate to the frontend directory:
```cmd
cd D:\Online_Trip_Booking_System\frontend
```

Start a simple HTTP server:
```cmd
python -m http.server 8000
```

Or if you have Node.js http-server installed:
```cmd
npx http-server -p 8000
```

## Complete Workflow Example

Here's a complete example of setting up and running the system:

```cmd
# 1. Navigate to backend directory
cd D:\Online_Trip_Booking_System\backend

# 2. Install dependencies
npm install

# 3. Setup environment
copy env.example .env

# 4. Start MongoDB
net start MongoDB

# 5. Setup database with sample data
node data_manager.js --action=setup

# 6. Check what was created
node data_manager.js --action=stats

# 7. Start the backend server
node server.js
```

In a new CMD window:
```cmd
# 8. Navigate to frontend
cd D:\Online_Trip_Booking_System\frontend

# 9. Start frontend server
python -m http.server 8000
```

## Troubleshooting

### Common Issues:

**1. MongoDB not starting:**
```cmd
# Check if MongoDB service is running
sc query MongoDB

# Start MongoDB service
net start MongoDB

# Or start manually
mongod --dbpath "C:\data\db"
```

**2. Port already in use:**
```cmd
# Kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**3. Node.js not found:**
```cmd
# Check if Node.js is installed
node --version

# If not installed, download from nodejs.org
```

**4. Permission errors:**
```cmd
# Run CMD as Administrator
# Right-click Command Prompt → "Run as administrator"
```

**5. Database connection failed:**
```cmd
# Check if MongoDB is running
net start MongoDB

# Check connection string in .env file
notepad .env
```

## Expected Output

When you run `node data_manager.js --action=setup`, you should see:

```
✅ Connected to MongoDB (Native Driver)
✅ Connected to MongoDB (Mongoose)
🔧 Setting up database...
   Created collection: users
   Created collection: flights
   Created collection: trains
   Created collection: hotels
   Created collection: bookings
   Created collection: admins
📊 Creating indexes...
   Created index on users
   Created index on flights
   ...
📝 Inserting initial data...
   Created admin user (admin@travelease.com / admin123)
🎲 Generating all data for 7 days...
✈️  Generating flights...
   Generated 21 flights
🚂 Generating trains...
   Generated 14 trains
🏨 Generating hotels...
   Generated 10 hotels
👥 Creating sample users...
   Created 5 sample users
📋 Generating 20 sample bookings...
   Generated 20 sample bookings
✅ Data generation completed
✅ Database setup completed
✅ Disconnected from MongoDB
```

## Admin Access

After setup, you can access the admin panel:
- URL: `http://localhost:8000/pages/admin/login.html`
- Email: `admin@travelease.com`
- Password: `admin123`

## API Endpoints

Once the server is running, you can test these endpoints:
- `http://localhost:3000/api/health` - Health check
- `http://localhost:3000/api/search/flights` - Search flights
- `http://localhost:3000/api/search/trains` - Search trains
- `http://localhost:3000/api/search/hotels` - Search hotels

## Next Steps

1. **Test the system** by visiting `http://localhost:8000`
2. **Create user accounts** through the registration form
3. **Search for flights/trains/hotels** using the search functionality
4. **Make bookings** as a logged-in user
5. **Access admin panel** to manage the system

## Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the console output for error messages
4. Ensure MongoDB is running and accessible
5. Verify your .env configuration

