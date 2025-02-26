# BudgetBuddy

## About

BudgetBuddy is a personal finance tracking application that helps users monitor their income and expenses. The application provides a user-friendly interface for managing transactions and categories, allowing users to maintain their financial records without complexity.

## Features

### Core Features

1. Transaction Management

   - Create, view, edit, and delete financial transactions
   - Filter transactions by date and category
   - Sort by amount or date
   - Track income and expenses

2. Category Management
   - Create custom categories for transactions
   - View all available categories
   - Edit category details
   - Delete unused categories

### Bonus Features

- Monthly spending reports and analytics
- Savings goal tracking and projections

## Technologies Used

### Frontend

- React
- Vanilla CSS
- React Router

### Backend

- Python
- Flask
- SQLAlchemy
- PostgreSQL

## Getting Started

### Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- PostgreSQL

### Local Development Setup

1. Clone the repository:

   - git clone https://github.com/yourusername/BudgetBuddy.git

   - cd BudgetBuddy

2. Create and activate a Python virtual environment:

   - pipenv install -r requirements.txt

   - pipenv shell

3. Set up environment variables:

   - cp .env.example .env

4. Create and seed the database:

   - flask db upgrade

   - flask seed all

5. Start the Flask backend server:

   - flask run

6. In a new terminal, install frontend dependencies and start the development server:

   - cd react-vite

   - npm install

   - npm run dev

7. Visit http://localhost:5173 in your browser to see the application

## Demo User

You can log in using the demo user credentials:

- Email: demo@aa.io

- Password: password

## Links

- [Live Site](https://budgetbuddy-c5xv.onrender.com)
- [MVP Feature List](https://github.com/muhammadelshareif/BudgetBuddy/wiki/MVP-Features)
- [Database Schema](https://github.com/muhammadelshareif/BudgetBuddy/wiki/Database-Schema)
- [User Stories](https://github.com/muhammadelshareif/BudgetBuddy/wiki/User-Stories)
- [Wireframes](https://github.com/muhammadelshareif/BudgetBuddy/wiki/Wireframes)

## Contact

Muhammad Elshareif

- [GitHub](https://github.com/yourusername)
- [LinkedIn](https://www.linkedin.com/in/yourusername)
