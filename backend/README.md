# Rupaya Backend

## How to Run

1.  **Install Dependencies**:
    ```bash
    uv sync
    ```

2.  **Start the Server**:
    ```bash
    uv run fastapi dev app/main.py
    ```
    Or using uvicorn directly:
    ```bash
    uv run uvicorn app.main:app --reload
    ```

## Environment Variables

Make sure you have a `.env` file with:
- `DATABASE_URL`
- `SECRET_KEY`
- `REDIS_URL`
