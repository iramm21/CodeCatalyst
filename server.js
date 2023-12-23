require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const usersRoutes = require('./routes/api/users');
const connectDB = require('./config/db');

connectDB();

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use('/api/users', usersRoutes);

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
