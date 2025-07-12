# 🏢 Main Service

The **main business logic microservice** for the Employee Attendance System.

- ✅ CRUD user (HRD only)
- 🕒 Attendance check-in and out (Employee)
- 🧾 Attendance logs with photos
- 🔐 Middleware for auth & role-based access
- 📤 Publishes events to RabbitMQ (for notif-service)

---

## 🛠 Installation

```bash
npm install
```

To start the development server:

```bash
npm run dev
```

---

## ⚙️ Environment Variables (.env) Example

```
PORT=3002
DB_NAME=your_db_name
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
RABBITMQ_URL=amqp://localhost:5672


```

---

## 📦 Folder Structure

```
main-service/
├── src/
│   ├── config/             # DB connection
│   ├── controllers/        # Attendance & Employee logic
│   ├── middlewares/        # Auth & Error middleware
│   ├── models/             # Sequelize models (User, Attendance)
│   ├── routes/             # Attendance & Employee routes
│   ├── utils/              # ResponseUtil, rabbitmq publisher, etc
│   └── index.ts            # Entry point
├── migrations/             # Sequelize migrations
├── config/                 # Sequelize config
├── seeders/                # Sequelize seeders
├── .env
├── tsconfig.json
└── package.json
```

---

## 🔗 Dependencies

- Sequelize

- bcrypt

- JWT

- RabbitMQ (via amqplib)
