const fs = require("fs");

db.createUser({
  pwd: fs.readFileSync(process.env.MONGO_INITDB_USER_PASSWORD_FILE, "utf-8"),
  roles: [
    {
      db: process.env.MONGO_INITDB_DATABASE,
      role: "readWrite",
    },
  ],
  user: process.env.MONGO_INITDB_USER_USERNAME,
});
