// require("dotenv").config();
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.DB_CONNECTION_KEY);

module.exports = {
  connectDb: async () => {
    await client.connect();
  },
  getDb: () => {
    return client.db();
  },
};
