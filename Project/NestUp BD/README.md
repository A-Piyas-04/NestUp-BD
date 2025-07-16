# NestUp BD

NestUp BD is a modern web application designed to connect property seekers with verified accommodations and essential relocation services across Bangladesh.

## Features

- **Property Search**: Find housing options with advanced filtering
- **Verified Listings**: All properties undergo verification for safety and quality
- **Secure Transactions**: End-to-end encrypted payment system
- **Relocation Services**: Access to transport, food, and other essential services
- **User Dashboard**: Manage listings, bookings, and account settings

## Tech Stack

- **Frontend**: React 19, React Router 7
- **Styling**: Custom CSS with design system
- **Backend**: Express.js (Node.js)
- **Authentication**: JWT-based auth system
- **Database**: MongoDB (planned)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/nestup-bd.git
   cd nestup-bd
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view the app in your browser.

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install server dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   node server.js
   ```

The backend will run on [http://localhost:3000](http://localhost:3000).

## Project Structure

```
nestup-bd/
├── public/             # Static assets
├── server/             # Backend server code
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   └── server.js       # Server entry point
└── src/
    ├── assets/         # Images, icons, etc.
    ├── components/     # Reusable UI components
    ├── context/        # React context providers
    ├── pages/          # Page components
    └── App.jsx         # Main app component
```

## Design System

NestUp BD uses a custom design system with consistent:
- Color palette
- Typography
- Spacing
- Shadows
- Border radii
- Component styles

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
