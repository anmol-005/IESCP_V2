# Influencer-Enterprise Sponsorship Connection Platform (IESCP)

A modern web platform that connects influencers with enterprises for sponsorship opportunities, developed as part of the Modern Application Development 2 course in the IITM BS Degree Program.

## Overview

IESCP facilitates connections between influencers and sponsors by providing a platform for:
- Influencers to showcase their profiles and reach
- Sponsors to create campaigns and ad requests
- Admin dashboard for platform management
- Secure authentication and session handling

## Technologies Used

- **Backend**: Flask, SQLAlchemy, Celery
- **Frontend**: Vue.js, Bootstrap
- **Database**: SQLite
- **Async Tasks**: Redis, Celery
- **Authentication**: Flask-Security

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js and npm (for frontend development)
- Redis server

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anmol-005/IESCP_V2.git
   cd IESCP_V2
   ```

2. **Set up a Python virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Redis** (if not already installed)
   - For Mac: `brew install redis`
   - For Ubuntu: `sudo apt install redis-server`
   - For Windows: Download from [Redis website](https://redis.io/download)

## Running the Application

1. **Start Redis server**
   ```bash
   redis-server
   ```

2. **Start Celery worker** (in a separate terminal)
   ```bash
   celery -A tasks.celery worker --loglevel=info
   ```

3. **Start the Flask application**
   ```bash
   python app.py
   ```

4. **Access the application**
   Open your browser and navigate to: `http://localhost:10000`

## User Credentials

### For testing purposes:

- **Influencer Login**:
  - Email: influencer@example.com
  - Password: password123

- **Sponsor Login**:
  - Email: sponsor@example.com
  - Password: password123

- **Admin Login**:
  - Email: admin@example.com
  - Password: password123

## Project Structure

- `app.py` - Main application entry point
- `routes.py` - API endpoints and routes
- `models.py` - Database models
- `static/` - Frontend resources
  - `components/` - Vue.js components
- `templates/` - HTML templates
- `tasks.py` - Celery tasks for async operations

## Features

1. **User Management**
   - Registration for influencers and sponsors
   - Profile management
   - Role-based access control

2. **Campaign Management**
   - Sponsors can create and manage campaigns
   - Public and private campaigns

3. **Ad Request System**
   - Influencers can apply to campaigns
   - Sponsors can approve/reject ad requests

4. **Admin Dashboard**
   - User management
   - Campaign oversight
   - Platform statistics

## Debugging

For debugging information and common solutions, please refer to the [CONTRIBUTION.md](CONTRIBUTION.md) file.

## Author
- [Anmol Kansal](https://github.com/anmol-005)


## License

This project is created as part of academic coursework for the IITM BS Degree Program. 