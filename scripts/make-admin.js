// usage: npm run make-admin -- user@example.com
const mongoose = require('mongoose');
const db = require('../db');
const User = require('../models/user');

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('usage: npm run make-admin -- <email>');
        process.exit(1);
    }

    await db.connect();
    const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { isAdmin: true },
        { returnDocument: 'after' }
    );
    console.log(user ? `${user.email} is now an admin (log in again to get an admin token)` : `no user with email ${email}`);
    await mongoose.disconnect();
    process.exitCode = user ? 0 : 1;
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
