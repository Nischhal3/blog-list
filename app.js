const mongoose = require('mongoose');
const express = require('express');
require('express-async-errors');
const cors = require('cors');
const app = express();
const logger = require('./utils/logger');
const config = require('./utils/config');
const blogsRouter = require('./controllers/blog')
const middleware = require('./utils/middleware');
const usersRouter = require('./controllers/user')

logger.info('Connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.info('Connected to MongoDB');
    })
    .catch(error => {
        logger.error(error.message)
    })

app.use(cors());
app.use(express.json());
app.use(express.static('build'));
app.use(middleware.requestLogger);

app.get('/', (req, res) => {
    res.send('<h1>Blogs List!</h1>')
})

app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;