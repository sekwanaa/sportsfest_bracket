const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;

const { ObjectId } = require("mongodb");

let exportedMethods = {

    //method to get all teams information
    async getAllUsers() {
        const userCollection = await users();
    
        const allUsers = await userCollection.find({}).toArray();
    
        return allUsers;
    },
  }
  
  
  module.exports = exportedMethods;