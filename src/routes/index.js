const express = require('express');
const authRoutes = require('./auth.route');
const userRoutes = require('./users.route');
const searchRoutes = require('./search.route');

const app = express();

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/data-search', searchRoutes);

module.exports = app;
