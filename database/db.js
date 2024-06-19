const { Client } = require("pg");
const { DB_URI } = require("../config/config");

const client = new Client({ connectionString: DB_URI });

client.connect();

module.exports = client;
