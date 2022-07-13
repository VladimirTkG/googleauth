const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

const MONGOURI = "mongodb+srv://manager:12348765@management-system.c69va.mongodb.net/management-system?retryWrites=true&w=majority";

const salt = bcrypt.genSaltSync(10);

mongoose.connect(MONGOURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
    console.log("Connected to DB");
}).catch((e) => {
    console.log("error = ", e);
})

const seedUsers = [
    {
        username: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hashSync("12348765", salt),
        roles: ['ADMIN']
    }
];

const seedDB = async () => {
    await Role.deleteMany({});
    const userRole = new Role({value: "USER"});
    const adminRole = new Role({value: "ADMIN"});
    await userRole.save();
    await adminRole.save();
    await User.deleteMany({});
    await User.insertMany(seedUsers);

}

seedDB().then(() => {
    mongoose.connection.close();
});