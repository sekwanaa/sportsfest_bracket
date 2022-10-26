require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const serverURI = process.env.serverURI;
const database = process.env.database

let _connection = undefined;
let _db = undefined;

module.exports = {
  dbConnection: async () => {
    if (!_connection) {
      _connection = await MongoClient.connect(`${serverURI}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      _db = await _connection.db(`${database}`);
    }

    return _db;
  },
  closeConnection: () => {
    _connection.close();
  },
};
