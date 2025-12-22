# Rupaya Backend

## Quick Start with Docker (Recommended)

The easiest way to get started is using Docker Compose, which sets up PostgreSQL and Redis automatically.

1.  **Start the services**:
    ```bash
    docker-compose up -d
    ```

2.  **Verify services are running**:
    ```bash
    docker-compose ps
    ```

3.  **View logs** (optional):
    ```bash
    docker-compose logs -f
    ```

4.  **Stop the services**:
    ```bash
    docker-compose down
    ```

5.  **Stop and remove volumes** (⚠️ deletes all data):
    ```bash
    docker-compose down -v
    ```

### Docker Services

The `docker-compose.yml` includes:

- **PostgreSQL 16** (Alpine)
  - Port: `5432`
  - User: `postgres`
  - Password: `postgres`
  - Database: `rupaya`
  - Container: `rupaya-postgres`

- **Redis 7.2** (Alpine)
  - Port: `6379`
  - Persistence: Enabled (AOF)
  - Container: `rupaya-redis`

### Connection Strings for Docker

When using Docker Compose, use these connection strings in your `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rupaya"
REDIS_URL="redis://localhost:6379"
```

## Manual Setup (Without Docker)

1.  **Install Dependencies**:
    ```bash
    uv sync
    ```

2.  **Start the Server**:
    ```bash
    uv run start.py
    ```
    This will start the server on the port specified in your `.env` file.

    Alternative methods:
    ```bash
    uv run fastapi dev app/main.py
    ```
    Or using uvicorn directly:
    ```bash
    uv run uvicorn app.main:app --reload --port 8000
    ```

## Environment Variables

Make sure you have a `.env` file with:
- `DATABASE_URL` - PostgreSQL database connection string
- `SECRET_KEY` - Secret key for JWT tokens
- `REDIS_URL` - Redis connection URL
- `PORT` - Port number for the backend server (default: 8000)
- `HOST` - Host address to bind to (default: 0.0.0.0)

## Code Quality

**Lint** (check for issues):
```bash
uv run ruff check .
```

**Format** (auto-fix formatting):
```bash
uv run ruff format .
```

**Lint and auto-fix**:
```bash
uv run ruff check --fix .
```

**Run both lint and format**:
```bash
uv run ruff check --fix . && uv run ruff format .
```
