const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const players = mongoCollections.players;

const { ObjectId } = require("mongodb");

let exportedMethods = {

    //method to get all teams information
    async getAllUsers() {
        const userCollection = await users();
    
        const allUsers = await userCollection.find({}).toArray();

        return allUsers;
    },

    async getUserByEmail(userEmail, param) {
        const userCollection = await users();

        const user = await userCollection.findOne({email: userEmail});
        let userObj = {}

        for (i=0; i<param.length; i++) {
            try {
                if (param[i] == "nickname") {
                    userObj.Nickname = user.email
                } else if (param[i] == "userRole") {
                    userObj.Role = user.user_metadata.role
                } else if (param[i] == "name") {
                    userObj.Name = user.user_metadata.name
                } else if (param[i] == "userId") {
                    userObj.UserId = user._id.toString()
                } else if (param[i] == "profilePic") {
                    userObj.ProfilePic = user.user_metadata.profilePic
                } else {
                    console.log("else")
                }
            } catch (error) {
                console.log(error)
            }
        };
        return userObj;
    },

    async updateUser(email, role) {
        const userCollection = await users();

        const roleChanged = await userCollection.findOneAndUpdate(
            {email: email}, 
            {$set: {
                "user_metadata.role": role,
                }
            }
        );

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

    async updateProfilePic(email, imagePath) {
        const userCollection = await users();

        const insertProfilePic = await userCollection.findOneAndUpdate(
            {
                email: email,
            },
            {
                $set: {
                    "user_metadata.profilePic": imagePath,
                }
            }
        )

        return;
    },

  }
  
  
  module.exports = exportedMethods;