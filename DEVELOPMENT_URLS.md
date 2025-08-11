# Local Development Setup

## Frontend Access
- **Local Development**: http://localhost:3000
- **Frontend Server**: Vite dev server with hot reload

## Backend API Base URL
- **Local API**: http://localhost:8080
- **API Endpoints**: http://localhost:8001/api/*

## Database
- **H2 Console**: http://localhost:8080/h2-console
- **JDBC URL**: jdbc:h2:mem:opexdb
- **Username**: sa
- **Password**: password

## Local Development Commands:

### Start Frontend:
```bash
cd frontend
yarn install
yarn start
```

### Start Backend:
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

### Or use convenience scripts:
```bash
# Start frontend
./start-frontend.sh

# Start backend  
./start-backend.sh
```

## Development Workflow:
1. ✅ Use localhost:3000 for frontend
2. ✅ Use localhost:8080 for backend API
3. ✅ H2 database runs in-memory
4. ✅ Hot reload enabled for frontend
5. ✅ Standard local development setup