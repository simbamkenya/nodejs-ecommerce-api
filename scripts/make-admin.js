// usage: npm run make-admin -- user@example.com
const db = require('../db');
const { userRepository } = require('../repositories');

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('usage: npm run make-admin -- <email>');
        process.exit(1);
    }

    await db.connect();
    const user = await userRepository.setAdminByEmail(email);
    console.log(user ? `${user.email} is now an admin (log in again to get an admin token)` : `no user with email ${email}`);
    await db.disconnect();
    process.exitCode = user ? 0 : 1;
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
