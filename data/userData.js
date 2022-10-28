const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;

const { ObjectId } = require("mongodb");

let exportedMethods = {

    //method to get all teams information
    async getAllUsers() {
        const userCollection = await users();
    
        const allUsers = await userCollection.find({}).toArray();
    
        // console.log(allUsers)

        return allUsers;
    },

    async getUserByEmail(userEmail) {
        const userCollection = await users();

        const user = await userCollection.findOne({email: userEmail});

        // console.log(user);

        return user;
    },

    async getUserByRole(userRole) {
        const userCollection = await users();

        const user = await userCollection.find({role: userRole}).toArray();

        // console.log(user);

        return user;
    },

    async updateUser(email, role) {
        const userCollection = await users();

        const roleChanged = await userCollection.findOneAndUpdate(
            {email: email}, 
            {$set: {
                user_metadata: {
                    role: role,
                }
            }
        });

        return;
    },
  }
  
  
  module.exports = exportedMethods;