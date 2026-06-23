# KisanGat

KisanGat is a comprehensive management system designed for farmer groups, cooperatives, and agricultural societies. It provides a robust backend and a modern frontend to manage various aspects of agricultural operations, including farmers, inventory, sales, collections, and financial reports.

## 🛠️ Tech Stack

### Backend
*   **Framework:** Django & Django REST Framework
*   **Database:** MySQL
*   **Authentication:** Simple JWT (JSON Web Tokens)
*   **Environment Management:** `python-dotenv`

### Frontend
*   **Framework:** React 18 (with Vite)
*   **UI Library:** Material-UI (MUI)
*   **State Management:** Redux Toolkit & React-Redux
*   **Form Handling:** React Hook Form & Zod for validation
*   **Routing:** React Router DOM
*   **Charts:** Recharts

### Infrastructure
*   **Containerization:** Docker & Docker Compose

## 📁 Project Structure

The project is divided into two main parts: `backend` and `frontend`.

```
KisanGat/
├── backend/               # Django REST API
│   ├── apps/              # Django apps (authentication, farmers, sales, etc.)
│   ├── config/            # Main project configuration
│   ├── core/              # Core functionalities and base models
│   ├── utils/             # Helper functions and utilities
│   ├── media/             # User-uploaded files
│   └── static/            # Static files
├── frontend/              # React Application
│   └── src/
│       ├── api/           # API integration and Axios instances
│       ├── components/    # Reusable UI components
│       ├── pages/         # Application pages/views
│       ├── store/         # Redux store and slices
│       ├── routes/        # Application routing
│       └── themes/        # MUI theme customization
└── docker-compose.yml     # Docker configuration for local development
```

## 🚀 Getting Started

### Prerequisites
*   [Docker](https://www.docker.com/) and Docker Compose (Recommended)
*   Python 3.10+ (for manual backend setup)
*   Node.js 18+ (for manual frontend setup)
*   MySQL (for manual backend setup)

### Option 1: Running with Docker (Recommended)

1.  Clone the repository and navigate to the project root directory.
2.  Create a `.env` file in the `backend/` directory based on your database configuration.
3.  Build and run the containers using Docker Compose:
    ```bash
    docker-compose up --build
    ```
4.  The backend API will be available at `http://localhost:8000`
5.  The frontend will be available at `http://localhost:5173`

### Option 2: Manual Setup

#### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt  # Alternatively, use the setup.py script
    ```
4.  Apply database migrations (make sure your MySQL server is running and configured):
    ```bash
    python manage.py migrate
    ```
5.  Start the development server:
    ```bash
    python manage.py runserver
    ```

#### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend` directory and configure the API base URL:
    ```env
    VITE_API_BASE_URL=http://localhost:8000/api
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

## 🧩 Features / Modules

*   **Authentication:** Secure login and access control using JWT.
*   **Dashboard:** High-level overview of key metrics and recent activities.
*   **Farmers Management:** Track and manage farmer profiles and details.
*   **Collections:** Manage daily/periodic agricultural collections from farmers.
*   **Sales & Customers:** Handle sales transactions and customer profiles.
*   **Inventory:** Track available stock and supplies.
*   **Financials:** Manage expenses, payments, and generate comprehensive reports.
*   **Settings:** Application-wide configuration and employee management.
