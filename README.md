# Zia Traders & Co. — Production-Ready E-Commerce Platform

**MERN Stack | Role-Based Access | CMS | Customer Support**

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

```bash
npm run install-all
cd backend && cp .env.example .env   # configure MONGO_URI, JWT_SECRET
npm run seed                        # from project root
npm run dev:backend                 # terminal 1
npm run dev:frontend                # terminal 2
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

---

## Demo Accounts (after seeding)

| Role       | Email                      | Password |
|------------|----------------------------|----------|
| Admin      | admin@ziatraders.pk        | 123456   |
| Seller     | seller@ziatraders.pk       | 123456   |
| Agronomist | agronomist@ziatraders.pk   | 123456   |
| Customer   | customer@ziatraders.pk     | 123456   |

---

## Features

- **Role-based auth:** Admin, Agronomist, Customer (and Seller)
- **E-commerce:** Product catalog, cart, checkout with tax/shipping, orders
- **Admin panel:** User CRUD, full product management, inventory, analytics, CMS
- **CMS:** Manage Homepage, About, and Shop Info from admin panel
- **Customer support:** Query submission and agronomist response system
- **Appointments:** Book, confirm, reschedule, and complete consultations
- **Agronomist portal:** Dedicated dashboard for queries and appointments
- **Responsive UI:** Mobile-first design across all pages

---

## Project Structure

```
zia-traders-co/
├── backend/          Node.js + Express REST API
│   ├── models/       Mongoose schemas
│   ├── routes/       API routes
│   ├── controllers/  Business logic
│   └── middleware/   Auth, error handling
└── frontend/         React.js SPA
    └── src/
        ├── pages/    Page components
        ├── components/
        └── context/  Auth, Cart state
```

---

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, React Router v6, Axios |
| Backend   | Node.js, Express, MongoDB, Mongoose |
| Auth      | JWT + bcryptjs |
| Real-time | Socket.io (chat) |

---

Developed by Zia Traders & Co. | Pakistan
