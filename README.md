# CreditGuard App

CreditGuard is a modern web application built with Angular 19.1.7 that helps users manage and monitor credit-related activities.

## Features

- User Authentication & Authorization
- Customer Management
- Transaction Monitoring
- Group Management
- Reporting System
- Dashboard Analytics

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)
- Angular CLI v19.1.7

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Development Server

Run the development server:

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

To build the project for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/credit-guard-app` directory.

## Project Structure

```
src/
├── app/
│   ├── auth/         # Authentication components
│   ├── customers/    # Customer management
│   ├── dashboard/    # Dashboard components
│   ├── groups/       # Group management
│   ├── reports/      # Reporting components
│   ├── shared/       # Shared components
│   ├── services/     # Application services
│   └── models/       # Data models
├── assets/          # Static assets
├── environments/    # Environment configurations
└── styles/         # Global styles
```

## Environment Configuration

The application uses two environment configurations:

- `environment.ts` - Production environment
- `environment.development.ts` - Development environment

Both environments are configured to connect to the Azure-hosted API:
```typescript
apiBaseUrl: 'https://creditguardapi-f0b3gvg5cne6fhe4.southindia-01.azurewebsites.net/api'
```

## Dependencies

Key dependencies include:
- Angular v19.1.0
- Angular Material v19.1.5
- Bootstrap v5.3.3
- RxJS v7.8.0

## Testing

Run unit tests:
```bash
npm test
```

## Code Scaffolding

Generate new components using Angular CLI:
```bash
ng generate component component-name
```

Other available generators:
- `ng generate directive|pipe|service|class|guard|interface|enum|module`

## Contributing

1. Follow Angular style guide and coding conventions
2. Write meaningful commit messages
3. Document new features and API changes
4. Add unit tests for new functionality

## Support

For support and questions, please refer to the project documentation or contact the development team.

## License

This project is proprietary software. All rights reserved.
