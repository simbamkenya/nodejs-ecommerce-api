require('express-async-errors')
const express = require('express');
const app = express();
const morgan = require('morgan');
const db = require('./db')

//routes
const productsRoutes = require('./routes/products')
const ordersRoutes = require('./routes/orders')
const categoriesRoutes = require('./routes/categories')
const usersRoutes = require('./routes/users')

//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('tiny'));
require('dotenv').config();
const api = process.env.API_URL

//routes
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, usersRoutes);





app.post(`${api}`, (req, res)=>{
     res.send(api)
})

app.listen(3000, ()=>{
    console.log(api)
     console.log('server is running on port 3000')
})