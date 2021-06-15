const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ecommerce-api', {
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(()=> console.log('mongodb is connected'));
module.exports = mongoose;