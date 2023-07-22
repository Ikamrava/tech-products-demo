import { Pool } from "pg";

import config from "./utils/config";
import logger from "./utils/logger";

const pool = new Pool({
	connectionString: config.dbUrl,
	connectionTimeoutMillis: 5_000,
	ssl: config.dbUrl.includes("localhost")
		? false
		: { rejectUnauthorized: false },
});

export const connectDb = async () => {
	let client;
	try {
		client = await pool.connect();
	} catch (err) {
		logger.error("%O", err);
		process.exit(1);
	}
	logger.info("Postgres connected to %s", client.database);
	client.release();
};

export const disconnectDb = () => pool.end();

/**
 * Access this with `import db from "path/to/db";` then use it with
 * `await db.query("<SQL>", [...<variables>])`.
 */
export default {
	query: (...args) => {
		if (!config.production) {
			logger.debug("Postgres querying %O", args);
		} else {
			logger.debug("Postgres querying %s", args[0]);
		}
		return pool.query.apply(pool, args);
	},
};