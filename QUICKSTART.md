# 🚀 Get Started in 5 Minutes

## Step 1: Open Backend Folder
```powershell
cd C:\Users\nitis\OneDrive\Documents\dbmsmini\backend
```

## Step 2: Create .env File (Database Credentials)

Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
notepad .env
```

**Paste and save** (replace with your MySQL password):
```
DB_HOST=localhost
DB_USER=mt_user
DB_PASS=your_db_password_here
DB_NAME=medicine_tracker
PORT=3000
```

## Step 3: Create Database (First Time Only)

Open MySQL:
```powershell
mysql -u root -p
```

Run these commands (replace password):
```sql
CREATE DATABASE IF NOT EXISTS medicine_tracker;
CREATE USER 'mt_user'@'localhost' IDENTIFIED BY 'your_db_password_here';
GRANT ALL PRIVILEGES ON medicine_tracker.* TO 'mt_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 4: Start Backend Server

```powershell
# From backend folder
npm run dev
# or: node server.js
```

✅ You should see: **Server running on port 3000**

## Step 5: Add Sample Data

**New PowerShell window:**
```powershell
cd C:\Users\nitis\OneDrive\Documents\dbmsmini\backend
node scripts/seed-data.js
```

✅ You should see: **Database seeding complete!**

## Step 6: Start Frontend

**Another new PowerShell window:**
```powershell
cd C:\Users\nitis\OneDrive\Documents\dbmsmini\frontend
python -m http.server 8000 --bind 127.0.0.1
```

✅ You should see: **Serving HTTP on 127.0.0.1 port 8000**

## Step 7: Open in Browser

**Copy-paste into address bar:**
```
http://127.0.0.1:8000/
```

## Step 8: Login

```
Username: admin
Password: admin123
```

---

## ✨ What You'll See

### Dashboard
- Total medicines: **8**
- Low stock: Shows items near reorder level
- Near expiry: Tracks medicines expiring soon
- Quick stats with beautiful cards

### View Medicines
- All 8 sample medicines listed
- Search by name
- Delete options

### Add Medicine
- Form to add new medicines
- Auto-populated suppliers from sample data

### Suppliers
- 3 sample suppliers already added
- Add new suppliers

### Alerts
- Expiry warnings
- Low stock alerts

### 3D Effects
- **Login page**: Rotating 3D cubes + floating medicine icons 💊
- **All pages**: Green theme + glowing cards
- **Smooth animations** on hover

---

## 📱 If Something Goes Wrong

### Backend won't start?
```powershell
# Check MySQL is running
net start MySQL80
# or
net start MySQL

# Test DB connection
mysql -u mt_user -p -D medicine_tracker -e "SELECT 1;"
```

### Frontend shows error?
- Make sure backend is running (port 3000)
- Use exact URL: `http://127.0.0.1:8000/`
- Refresh page (Ctrl+R or F5)

### No data showing?
```powershell
# Reseed the database
cd backend
node scripts/seed-data.js
```

### Need to stop servers?
- **Ctrl+C** in each PowerShell window

---

## 🎨 3D Visual Features Added

✅ **Login Page**
- 3D rotating medicine cubes
- Floating medicine/health icons (💊🩺⚕️🏥)
- Gradient background

✅ **Welcome Page**
- Same 3D elements
- Modern hero section
- Call-to-action buttons

✅ **All Pages**
- Green & white professional theme
- Glowing hover effects on cards
- Stat cards with enhanced styling
- Responsive mobile design

---

## 📊 Sample Data Included

**Medicines** (8 items):
- Paracetamol, Amoxicillin, Aspirin, Metformin, Omeprazole, Vitamin C, Ibuprofen, Loratadine
- Various expiry dates (some expiring soon, some far out)
- Batch numbers, manufacturers, prices

**Suppliers** (3):
- PharmaCorp Ltd
- HealthCare Imports
- MediGlobal Solutions

---

## 🔄 Offline Mode

If backend goes down:
- ✅ You can still **add/edit** data locally
- ✅ Data saves to browser storage
- ✅ Auto-syncs when backend comes back online
- ✅ Shows cached data while offline

---

## 📝 Next Steps

1. **Explore** the dashboard and all pages
2. **Add more medicines** via "Add Medicine" page
3. **Add suppliers** via "Suppliers" page
4. **Customize** colors in `frontend/css/styles.css`
5. **Deploy** to production (update `.env` for production DB)

---

## 🆘 Need Help?

All files have comments explaining the code. Main files:
- `backend/db.js` — Database connection
- `backend/server.js` — Server setup
- `frontend/js/app.js` — Authentication + API calls
- `frontend/css/styles.css` — All styling including 3D effects

Happy medicine tracking! 🏥💊
