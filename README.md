# Rupaya - Expense Splitting Application

Rupaya is a bill-splitting and expense-tracking application. It provides a robust API to manage users, groups, bills, and shared expenses.

## Features

*   **User Management:** Secure user registration and authentication using JWT.
*   **Group Creation:** Create and manage groups for sharing expenses.
*   **Bill Tracking:** Add bills to groups and track who has paid.
*   **Expense Splitting:** Divide expenses among group members (Equal, Exact, Percentage).
*   **Real-time Updates:** (Planned)

## Tech Stack

*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) (Async) with [Alembic](https://alembic.sqlalchemy.org/) migrations
*   **Authentication:** [python-jose](https://github.com/mpdavis/python-jose) for JWT handling
*   **Frontend:** Next.js
*   **Deployment:** Docker Compose

## Getting Started (Full Stack)

### Prerequisites

*   Docker & Docker Compose

### Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/Rupaya.git
    cd Rupaya
    ```

2.  **Set up Backend Environment:**
    ```bash
    cd backend
    cp .env.example .env
    # Edit .env if needed
    cd ..
    ```

3.  **Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```

This will run the Backend (API), Frontend (Next.js), PostgreSQL, and Redis.

*   Frontend: `http://localhost:3000`
*   Backend API Docs: `http://localhost:8000/docs`
*   pgAdmin: `http://localhost:5050`

## Database Schema & Migrations

The database models are defined using SQLAlchemy in `backend/app/db/models.py`.
Migrations are managed by Alembic.

To create a new migration after changing models:
```bash
cd backend
uv run alembic revision --autogenerate -m "description_of_changes"
```

To apply migrations manually (auto-applied in Docker):
```bash
uv run alembic upgrade head
```

## Testing

The project is set up for testing using `pytest`. To run the tests:

```bash
cd backend
uv run pytest
```
