# Complaint Management System

A React-based complaint management system with authentication, role-based access control, and a clean, modern UI.

## Features

- 🔐 JWT-based authentication
- 👥 Role-based access control (Admin, Manager, Employee, Customer)
- 📝 Complaint management (Create, Read, Update, Delete)
- 🔍 Search and filter complaints
- 📊 Dashboard with statistics
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Context API

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── complaints/     # Complaint management components
│   ├── common/         # Shared components
│   └── layout/         # Layout components (Header, Sidebar)
├── contexts/          # React Context providers
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── services/          # API service layer
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd world_of_dc_ui
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Update the environment variables in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Backend Integration

This frontend is designed to work with a Java Spring Boot backend. The expected API endpoints are:

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Complaint Endpoints

- `GET /api/complaints` - Get paginated complaints
- `GET /api/complaints/{id}` - Get complaint by ID
- `POST /api/complaints` - Create new complaint
- `PUT /api/complaints/{id}` - Update complaint
- `DELETE /api/complaints/{id}` - Delete complaint
- `GET /api/complaints/status/{status}` - Get complaints by status
- `GET /api/complaints/priority/{priority}` - Get complaints by priority
- `GET /api/complaints/category/{category}` - Get complaints by category
- `GET /api/complaints/search?q={query}` - Search complaints

## API Response Format

All API responses should follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

## Authentication

The application uses JWT tokens for authentication. The token is stored in localStorage and automatically included in API requests.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

Login employeeId: EMP001
Password: Passw0rd!
Role: OFFICER
