# Rupaya Backend

## How to Run

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
