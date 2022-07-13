const mongoose = require("mongoose");

const MONGOURI = "mongodb+srv://Vladimir:1234pass@cluster0.ib9vk.mongodb.net/BDTest?retryWrites=true&w=majority";

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true
    });
    console.log("Connected to DB");
  } catch (e) {
        console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;