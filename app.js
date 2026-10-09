const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const db = require('./db');
const errorHandler = require('./middleware/error');

const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const categoriesRoutes = require('./routes/categories');
const usersRoutes = require('./routes/users');

const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('tiny'));

//routes
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/users', usersRoutes);

app.use((req, res) => res.status(404).send({ error: 'Not found' }));
app.use(errorHandler);

if (require.main === module) {
    db.connect()
        .then(() => {
            app.listen(config.port, () => console.log(`server is running on port ${config.port}`));
        })
        .catch((err) => {
            console.error('FATAL ERROR: could not connect to mongodb', err.message);
            process.exit(1);
        });
}

module.exports = app;
