# Admin Panel

A simple admin panel for monitoring user data and site visitors.

## Access

Navigate to: `http://localhost:3000/admin`

## Login

**Default Password:** `admin123`

*Note: In production, implement proper authentication with secure passwords and user management.*

## Features

### 1. User Data
- View all collected user information from form submissions
- Shows username, name, phone number, IP address, browser, and timestamp
- Displays data from completed user sessions

### 2. Site Visitors
- Track all site visitors and their activity
- Shows IP address, browser, visited path, HTTP method, and timestamp
- Displays last 50 visitors (most recent first)
- Tracks unique IP addresses

### 3. Statistics Dashboard
- **Total Users:** Number of completed user sessions
- **Total Logins:** Number of login attempts
- **Site Visitors:** Total number of site visits
- **Unique IPs:** Number of unique IP addresses

## API Endpoints

The admin panel uses these backend endpoints:

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/user-data` - Retrieve user data
- `GET /api/admin/visitors` - Retrieve visitor data
- `GET /api/admin/stats` - Get statistics

## Data Storage

- User data is stored in `backend/collected_data.json`
- Visitor data is stored in memory (last 1000 visitors)
- Data persists across server restarts for user data
- Visitor data resets on server restart

## Security Notes

- Simple password authentication (not production-ready)
- No session management
- No rate limiting
- Admin routes are not protected by the main security script

## Customization

### Changing Admin Password
Edit `backend/server.js` and change the `ADMIN_PASSWORD` constant:

```javascript
const ADMIN_PASSWORD = 'your-secure-password';
```

### Modifying Data Display
Edit `src/components/AdminPanel.tsx` to customize:
- Table columns
- Data formatting
- Statistics calculations
- UI layout

### Styling
Admin panel styles are in `src/App.css` under the "Admin Panel Styles" section.

## Production Considerations

1. **Authentication:** Implement proper JWT or session-based authentication
2. **Database:** Replace JSON file storage with a proper database
3. **Security:** Add rate limiting, CSRF protection, and input validation
4. **Logging:** Add comprehensive logging for admin actions
5. **Access Control:** Implement role-based access control
6. **Data Retention:** Add data retention policies and cleanup
7. **Monitoring:** Add real-time monitoring and alerts
