# TableTap – Smart Restaurant Ordering & Bill Splitting System

## About the Project

TableTap is a smart restaurant ordering system designed to simplify the dining experience through digital table-based ordering and bill management.

The application is built using Flask, HTML, CSS, JavaScript, and SQLite, and is containerized using Docker.

## Features

- Digital restaurant menu
- Shopping cart and quantity management
- Order placement
- Smart bill-splitting interface:
  - Equal Split
  - Split by Items
  - Custom Split
- SQLite database for order storage
- Responsive user interface

## Technologies Used

- Python
- Flask
- HTML5
- CSS3
- JavaScript
- SQLite
- Docker
- Docker Compose

## Docker Implementation

TableTap is containerized using Docker.

The project includes:

- Dockerfile for building the application image
- Docker Compose for container management
- SQLite persistent storage using a named Docker volume
- Environment variables for database configuration
- `.dockerignore` to exclude unnecessary files

## Project Structure

```text
TableTap/
├── app.py
├── requirements.txt
├── Dockerfile
├── compose.yaml
├── .dockerignore
├── README.md
├── templates/
│   ├── index.html
│   ├── kitchen.html
│   └── admin.html
└── static/
    ├── style.css
    ├── script.js
    └── images/
```

## Run Using Docker Compose

### 1. Build and start the application

```bash
docker compose up --build -d
```

### 2. Open the application

```text
http://localhost:5000
```

### 3. Check running containers

```bash
docker compose ps
```

### 4. Stop the application

```bash
docker compose down
```

## Persistent Storage

Docker Compose uses a named volume called `tabletap-data` to preserve the SQLite database at:

```text
/app/data/tabletap.db
```

The database volume remains available when the container is stopped and recreated.

## Learning Outcomes

- Understanding Docker architecture and containerization
- Creating and building Docker images
- Running Flask applications inside containers
- Managing containers using Docker Compose
- Configuring persistent storage with Docker volumes
- Working with environment variables

## Author

Aishwarya K.

B.Tech – Artificial Intelligence and Data Science

## Module

Codomax Digital Solutions – Module 4: Docker & Containerization
