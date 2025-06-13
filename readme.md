# DevTinder Server

A modern backend service for connecting developers, built with Node.js, Express, and TypeScript.

## 🚀 Features

- RESTful API architecture
- TypeScript for type safety
- MongoDB integration with Mongoose
- JWT-based authentication
- Rate limiting and security features
- Swagger API documentation
- Comprehensive testing setup
- Code quality tools and pre-commit hooks
- SonarQube integration for code analysis

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- SonarQube server (for code analysis)

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd devTinder-server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/devtinder
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## 🏗️ Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middlewares/    # Custom middlewares
├── models/         # Mongoose models
├── routes/         # API routes
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── __tests__/      # Test files
└── index.ts        # Application entry point
```

## 🚀 Development

### Starting the Development Server

```bash
npm run dev
```

### Code Quality Tools

#### Formatting

```bash
npm run format          # Format all files
npm run format:check    # Check formatting without making changes
```

#### Linting

```bash
npm run lint           # Check for linting errors
npm run lint:fix       # Fix auto-fixable linting errors
```

#### Testing

```bash
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
npm run test:file -- "pattern"  # Test specific files
```

#### Building and Running

```bash
npm run build         # Compile TypeScript to JavaScript
npm start            # Run production build
```

### Pre-commit Hooks

The project uses Husky and lint-staged to ensure code quality before commits. The following checks run automatically:

- Code formatting
- Linting
- Tests related to changed files

### SonarQube Analysis

```bash
npm run sonar        # Run SonarQube analysis
```

## 📦 Dependencies

### Core Dependencies

- `express`: Web framework
- `mongoose`: MongoDB ODM
- `jsonwebtoken`: JWT authentication
- `bcrypt`: Password hashing
- `cors`: Cross-origin resource sharing
- `helmet`: Security middleware
- `compression`: Response compression
- `express-rate-limit`: Rate limiting
- `express-validator`: Input validation
- `winston`: Logging
- `zod`: Runtime type checking

### Development Dependencies

- `typescript`: TypeScript support
- `jest`: Testing framework
- `eslint`: Code linting
- `prettier`: Code formatting
- `husky`: Git hooks
- `lint-staged`: Run linters on staged files
- `sonarqube-scanner`: Code quality analysis

## 🚢 Deployment

### Local Deployment

1. Build the project:

```bash
npm run build
```

2. Start the server:

```bash
npm start
```

### Cloud Deployment

#### Heroku

1. Install Heroku CLI
2. Login to Heroku:

```bash
heroku login
```

3. Create a new Heroku app:

```bash
heroku create your-app-name
```

4. Add MongoDB add-on:

```bash
heroku addons:create mongolab
```

5. Deploy:

```bash
git push heroku main
```

#### AWS Elastic Beanstalk

1. Install AWS CLI and EB CLI
2. Initialize EB application:

```bash
eb init
```

3. Create environment:

```bash
eb create
```

4. Deploy:

```bash
eb deploy
```

## 🔧 Environment Variables

| Variable    | Description                          | Default     |
| ----------- | ------------------------------------ | ----------- |
| PORT        | Server port                          | 3000        |
| MONGODB_URI | MongoDB connection string            | -           |
| JWT_SECRET  | JWT signing secret                   | -           |
| NODE_ENV    | Environment (development/production) | development |

## 📈 Future Enhancements

1. Add WebSocket support for real-time features
2. Implement Redis caching
3. Add GraphQL support
4. Implement CI/CD pipeline
5. Add Docker support
6. Implement microservices architecture
7. Add monitoring and logging services
8. Implement rate limiting based on user tiers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Babu - Initial work

## 🙏 Acknowledgments

- Express.js team
- TypeScript team
- MongoDB team
- All contributors and maintainers
