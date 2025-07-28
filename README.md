# Afiagate Web App

A modern, responsive healthcare platform web application built with React, TypeScript, and Material-UI. This web app allows patients to find and book appointments with healthcare professionals and facilities.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login and registration system
- **Doctor Search**: Find healthcare professionals by specialization and location
- **Facility Search**: Discover healthcare facilities with detailed information
- **Appointment Booking**: Book appointments with doctors and facilities
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### User Experience
- **Modern UI/UX**: Clean, professional design inspired by modern healthcare platforms
- **Real-time Search**: Instant search and filtering capabilities
- **Interactive Components**: Hover effects, loading states, and smooth transitions
- **Form Validation**: Comprehensive client-side validation with error handling

### Technical Features
- **TypeScript**: Full type safety and better development experience
- **Material-UI**: Consistent, accessible, and customizable components
- **React Router**: Client-side routing with navigation
- **Context API**: Global state management for authentication
- **Axios**: HTTP client with interceptors for token management

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Build Tool**: Create React App
- **Package Manager**: npm

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd afiagate-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:8080
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🔧 Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Main layout components
│   └── UI/            # Common UI components
├── contexts/           # React contexts for state management
├── pages/             # Page components
├── services/          # API services and utilities
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🔌 API Integration

The web app connects to the Afiagate backend API with the following endpoints:

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users` - List users (doctors)

### Facilities
- `GET /api/v1/facilities` - List facilities
- `GET /api/v1/facilities/:id` - Get facility details
- `POST /api/v1/facilities/:id/book` - Book facility

### Appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments` - List appointments
- `GET /api/v1/appointments/:id` - Get appointment details
- `PUT /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Cancel appointment

## 🎨 Design System

The application uses a consistent design system with:

- **Color Palette**: Primary blue (#1976d2) with supporting colors
- **Typography**: Roboto font family with defined hierarchy
- **Spacing**: Consistent 8px grid system
- **Components**: Material-UI components with custom styling
- **Icons**: Material Icons throughout the application

## 🔐 Authentication

The app implements JWT-based authentication with:

- **Token Storage**: Access and refresh tokens stored in localStorage
- **Auto-refresh**: Automatic token refresh on 401 responses
- **Protected Routes**: Route protection based on authentication status
- **User Context**: Global user state management

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile-first approach**: Optimized for mobile devices
- **Breakpoints**: Material-UI breakpoint system
- **Flexible layouts**: Grid and Flexbox layouts
- **Touch-friendly**: Optimized for touch interactions

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
Set the following environment variables:
- `REACT_APP_API_URL` - Backend API URL

### Deployment Options
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect GitHub repository for automatic deployment
- **AWS S3**: Upload build files to S3 bucket
- **Docker**: Use Docker for containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🔄 Backend Integration

This web app is designed to work with the Afiagate backend API. Make sure the backend server is running and accessible at the configured API URL.

For backend setup instructions, refer to the [Afiagate Backend Repository](https://github.com/harry-kuria/afiagate-backend).
