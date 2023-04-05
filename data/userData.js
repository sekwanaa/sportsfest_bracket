const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const players = mongoCollections.players;

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

    async updateProfileInfo(userId, name, shirtNum, position) {
        const userCollection = await users();
        const playerCollection = await players();

        const updateUser = await userCollection.findOneAndUpdate(
            {_id: new ObjectId(userId)},
            {$set:
                {
                    "user_metadata.name" : name
                }
            }
        );

        const updatedProfile = await playerCollection.findOneAndUpdate(
            {userId: userId},
            {$set: 
                {   
                    name: name, 
                    shirtNum: shirtNum,
                    position: position,
                }
            }
        );

        return updatedProfile;
    },

  }
  
  
  module.exports = exportedMethods;