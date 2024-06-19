require("dotenv").config();
const SECRET_KEY_FALLBACK = require("./fallbackVariables");

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///yam_test";
} else if (process.env.NODE_ENV === "production") {
  DB_URI = process.env.SUPABASE_DB_URL;
} else {
  DB_URI = "postgresql:///yam";
}

const SECRET_KEY = process.env.SECRET_KEY || SECRET_KEY_FALLBACK;
const BCRYPT_WORK_FACTOR = 12;

module.exports = { DB_URI, SECRET_KEY, BCRYPT_WORK_FACTOR };
