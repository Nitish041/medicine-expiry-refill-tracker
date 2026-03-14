# Medicine Expiry & Refill Tracker - Setup & Usage Guide

## Quick Start

### 1. Backend Setup

#### Create Database & User (First Time Only)

Open MySQL and run:
```sql
CREATE DATABASE IF NOT EXISTS medicine_tracker;
CREATE USER 'mt_user'@'localhost' IDENTIFIED BY 'strongpassword';
GRANT ALL PRIVILEGES ON medicine_tracker.* TO 'mt_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Setup Environment Variables

Create `backend/.env`:
```
DB_HOST=localhost
DB_USER=mt_user
DB_PASS=strongpassword
DB_NAME=medicine_tracker
PORT=3000
```

#### Initialize Database & Seed Sample Data

```bash
# Run from backend folder
cd backend

# Install dependencies (first time)
npm install

# Start the server
npm run dev
# or: node server.js
```

When the backend starts successfully, you'll see:
```
Server running on port 3000
```

### 2. Add Sample Data

In a new PowerShell window:
```bash
cd backend
node scripts/seed-data.js
```

This adds:
- 3 sample suppliers
- 8 sample medicines with expiry dates, batch numbers, pricing
- Medicines now show on Dashboard and View Medicines page

### 3. Start Frontend

In another PowerShell window:
```bash
cd frontend
python -m http.server 8000 --bind 127.0.0.1
```

Open browser: **http://127.0.0.1:8000/**

## Login Credentials

**Demo Account:**
- Username: `admin`
- Password: `admin123`

## Features & Pages

### Dashboard
- View total medicines count
- Track low stock items
- Monitor near-expiry medicines
- See recently expired items
- Quick stats overview

### View Medicines
- Browse all stocked medicines
- Search by name, batch, or barcode
- Delete medicines
- See supplier info

### Add Medicine
- Add new stock items
- Fill batch number, manufacturer, supplier
- Set purchase & expiry dates
- Specify price, quantity, reorder level

### Suppliers
- Add/manage suppliers
- View contact info & emails
- Track supplier addresses

### Alerts
- Automated expiry alerts
- Low stock notifications
- Create refill requests
- View priority items

### 3D & Visual Enhancements

- **Login & Welcome Pages**: 3D rotating cubes + floating medicine icons
- **All Pages**: Green gradient backgrounds + glowing card hover effects
- **Dashboard Stats**: Enhanced stat cards with color-coded values
- **Responsive**: Works on desktop, tablet, mobile

## Offline Mode

If backend goes down:
- **Add/Edit**: Data saves locally to browser localStorage
- **Auto-Sync**: When backend comes back online, data automatically syncs
- **View**: Shows cached data from offline storage

## Troubleshooting

### Backend won't start
- Check `.env` has correct DB credentials
- Verify MySQL is running: `net start MySQL80` (or MySQL service name)
- Run: `mysql -u mt_user -p -D medicine_tracker -e "SELECT 1;"`

### Frontend shows "ERR_ADDRESS_INVALID"
- Use correct URL: `http://127.0.0.1:8000/`
- Start server with: `python -m http.server 8000 --bind 127.0.0.1`

### No medicines showing
- Run seed script: `node scripts/seed-data.js`
- Or manually add via "Add Medicine" page
- Refresh dashboard after adding

### API calls fail (network errors)
- Confirm backend runs on port 3000
- Check `frontend/js/app.js` line 1: `API_BASE` should be `http://localhost:3000/api`
- Backend logs will show API request details

## Development

### Add More Sample Data

Edit `backend/scripts/seed-data.js` and add more medicine/supplier objects, then run it again.

### Customize Colors

Edit `frontend/css/styles.css`:
- `--green-main` — primary brand color
- `--green-dark` — dark shade for hover
- `--bg-light` — page background
- `--card-bg` — card background

### Enable/Disable 3D Animations

In HTML files, remove or comment out:
- `.cube-wrapper` divs (3D cubes)
- `.float-element` divs (floating icons)

Or edit CSS `@keyframes` animation speeds.

## Architecture

```
dbmsmini/
├── backend/
│   ├── db.js          — MySQL connection
│   ├── server.js      — Express server
│   ├── routes/        — API endpoints
│   ├── scripts/
│   │   └── seed-data.js  — Sample data
│   ├── .env           — Your DB credentials
│   └── package.json
├── frontend/
│   ├── *.html         — Pages
│   ├── css/styles.css — Styling (green theme + 3D effects)
│   ├── js/app.js      — Auth, API, offline sync
│   └── package.json (optional)
└── sql/
    ├── schema.sql     — Database tables
    ├── sample_data.sql
    └── triggers_and_procs.sql
```

## API Endpoints

- `GET /api/medicines` — List all medicines
- `POST /api/medicines` — Add medicine
- `DELETE /api/medicines/:id` — Remove medicine
- `GET /api/suppliers` — List suppliers
- `POST /api/suppliers` — Add supplier
- `POST /api/refill` — Create refill request
- `GET /api/reports/alerts` — Get expiry/low stock alerts

## Next Steps

1. **Deploy**: Copy to server, update `.env` with production DB
2. **Users**: Implement backend authentication (JWT tokens)
3. **Barcode**: Enable barcode scanning on mobile
4. **Printing**: Add label/report printing
5. **Analytics**: Track usage, stock trends
6. **Sync**: Implement cloud backup for offline data

---

**Built with:** Node.js + Express + MySQL + Bootstrap + Vanilla JS
