require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

require('dotenv').config();
const express = require('express');const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

connectDB();

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// API Documentation (Swagger)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-docs', (req, res) => res.redirect('/api/docs'));
app.get('/api/docs.json', (req, res) => res.json(swaggerDocument));

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});
}

module.exports = app;
