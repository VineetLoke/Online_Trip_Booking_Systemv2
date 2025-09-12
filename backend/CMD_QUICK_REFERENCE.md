# CMD Quick Reference - Online Booking System

## 🚀 Quick Start Commands

### Navigate to Project
```cmd
cd D:\Online_Trip_Booking_System\backend
```

### One-Click Setup (Easiest)
```cmd
setup_and_run.bat
```

### Manual Setup
```cmd
npm install
copy env.example .env
net start MongoDB
node data_manager.js --action=setup
node server.js
```

## 📊 Data Management Commands

### Using Batch File (Easier)
```cmd
run_data_manager.bat setup
run_data_manager.bat stats
run_data_manager.bat generate flights 7
run_data_manager.bat add-sample 50
run_data_manager.bat clear
```

### Using Node.js Directly
```cmd
node data_manager.js --action=setup
node data_manager.js --action=stats
node data_manager.js --action=generate --type=flights --days=7
node data_manager.js --action=add-sample --count=50
node data_manager.js --action=clear
```

## 🔧 Server Commands

### Start Backend Server
```cmd
node server.js
```

### Start Frontend Server (New CMD Window)
```cmd
cd D:\Online_Trip_Booking_System\frontend
python -m http.server 8000
```

## 🗄️ MongoDB Commands

### Start MongoDB Service
```cmd
net start MongoDB
```

### Stop MongoDB Service
```cmd
net stop MongoDB
```

### Check MongoDB Status
```cmd
sc query MongoDB
```

### Start MongoDB Manually
```cmd
mongod --dbpath "C:\data\db"
```

## 🔍 Troubleshooting Commands

### Check Node.js Version
```cmd
node --version
npm --version
```

### Check Port Usage
```cmd
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

### Kill Process by PID
```cmd
taskkill /PID <PID_NUMBER> /F
```

### Check Environment File
```cmd
type .env
notepad .env
```

## 📁 File Operations

### List Files
```cmd
dir
dir /b
```

### Copy Files
```cmd
copy env.example .env
```

### Create Directory
```cmd
mkdir data
```

### Remove Files
```cmd
del filename.js
```

## 🌐 Access URLs

After running the servers:
- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:3000
- **Admin Panel**: http://localhost:8000/pages/admin/login.html
- **API Health**: http://localhost:3000/api/health

## 👤 Admin Credentials

- **Email**: admin@travelease.com
- **Password**: admin123

## 📋 Common Workflows

### Complete Fresh Setup
```cmd
cd D:\Online_Trip_Booking_System\backend
setup_and_run.bat
```

### Add More Data
```cmd
run_data_manager.bat generate all 30
run_data_manager.bat add-sample 100
```

### Check System Status
```cmd
run_data_manager.bat stats
```

### Reset Everything
```cmd
run_data_manager.bat clear
run_data_manager.bat setup
```

### Development Workflow
```cmd
# Terminal 1 - Backend
cd D:\Online_Trip_Booking_System\backend
node server.js

# Terminal 2 - Frontend  
cd D:\Online_Trip_Booking_System\frontend
python -m http.server 8000
```

## ⚠️ Important Notes

1. **Always run CMD as Administrator** for MongoDB operations
2. **Keep MongoDB running** while using the system
3. **Use separate CMD windows** for frontend and backend
4. **Check .env file** if you get connection errors
5. **Backup data** before running clear operations

## 🆘 Emergency Commands

### If Everything Breaks
```cmd
# Stop all services
net stop MongoDB
taskkill /f /im node.exe

# Restart everything
net start MongoDB
cd D:\Online_Trip_Booking_System\backend
setup_and_run.bat
```

### Reset Database Only
```cmd
run_data_manager.bat clear
run_data_manager.bat setup
```

### Check What's Running
```cmd
tasklist | findstr node
tasklist | findstr mongod
```
