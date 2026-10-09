require('dotenv').config({ quiet: true });

const config = {
    jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-api',
    port: Number(process.env.PORT) || 3000
};

if (!config.jwtPrivateKey) {
    console.error('FATAL ERROR: JWT_PRIVATE_KEY is not defined. Copy .env.example to .env and set it.');
    process.exit(1);
}

module.exports = config;
