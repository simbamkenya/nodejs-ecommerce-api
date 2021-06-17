const config = require('config')
require('express-async-errors')
const express = require('express');
const app = express();
const morgan = require('morgan');
const db = require('./db');

if(!config.get('jwtPrivateKey')){
     console.error('FATAL ERROR: jwtPrivateKey is not defined');
     process.exit(1);
}

//routes
const productsRoutes = require('./routes/products')
const ordersRoutes = require('./routes/orders')
const categoriesRoutes = require('./routes/categories')
const usersRoutes = require('./routes/users')

//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('tiny'));
// // require('dotenv').config();
// const api = process.env.API_URL

//routes
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/users', usersRoutes);





// app.post(`${api}`, (req, res)=>{
//      res.send(api)
// })

app.listen(3000, ()=>{
    console.log(config.get('jwtPrivateKey'))
     console.log('server is running on port 3000')
})