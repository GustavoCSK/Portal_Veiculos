const path = require("node:path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({
	path: path.resolve(__dirname, "../credentials.env"),
});

const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_ADMIN_USER = process.env.DB_ADMIN_USER;
const DB_ADMIN_PASSWORD = process.env.DB_ADMIN_PASSWORD;
const AUTH_SOURCE = process.env.AUTH_SOURCE || DB_NAME;

async function ensureUser(authDb, username, password, roles) {
	const usersResult = await authDb.command({ usersInfo: 1 });
	const existingUser = usersResult.users.find((user) => user.user === username);

	if (existingUser) {
		console.log("MongoDB user already exists: " + username);
		return;
	}

	await authDb.command({
		createUser: username,
		pwd: password,
		roles,
	});

	console.log("MongoDB user created: " + username);
}

async function main() {
	const missing = Object.entries({
		DB_NAME,
		DB_HOST,
		DB_PORT,
		DB_USER,
		DB_PASSWORD,
		DB_ADMIN_USER,
		DB_ADMIN_PASSWORD,
		AUTH_SOURCE,
	})
		.filter(([, value]) => !value)
		.map(([name]) => name);

	if (missing.length) {
		throw new Error("Missing MongoDB configuration: " + missing.join(", "));
	}

	if (DB_USER === DB_ADMIN_USER) {
		throw new Error("DB_USER and DB_ADMIN_USER must be different");
	}

	const uri = "mongodb://" + DB_HOST + ":" + DB_PORT + "/" + AUTH_SOURCE;
	await mongoose.connect(uri);

	try {
		const authDb = mongoose.connection.db;

		await ensureUser(authDb, DB_ADMIN_USER, DB_ADMIN_PASSWORD, [
			{ role: "dbAdmin", db: DB_NAME },
			{ role: "userAdmin", db: DB_NAME },
		]);

		await ensureUser(authDb, DB_USER, DB_PASSWORD, [
			{ role: "readWrite", db: DB_NAME },
		]);
	} finally {
		await mongoose.disconnect();
	}
}

main().catch((error) => {
	console.error("Database initialization failed:", error.message);
	process.exitCode = 1;
});
