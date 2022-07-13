const express = require("express");
const bodyParser = require("body-parser");
const { google } = require('googleapis');
const cors = require('cors');
const InitiateMongoServer = require("./config/db.config");
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const peopleRouter = require('./routes/peopleRouter');
const leadRouter = require('./routes/leadRouter');
const messageRouter = require('./routes/messageRouter');
const eventRouter = require('./routes/eventRouter');
const listRouter = require('./routes/listRouter');
const CronJob = require('cron').CronJob;
const app = express();
app.use(cors());
const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');
const UpdateWatch = require("./config/notification.config");

var options = {
  explorer: true
};

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3101;

app.get("/", (req, res) => {
  res.json({ message: "API Working" });
});

// app.use("/auth", authRouter);
app.use("/user", userRouter);
// app.use("/people", peopleRouter);
// app.use("/lead", leadRouter);
// app.use("/message", messageRouter);
// app.use("/event", eventRouter);
// app.use("/list", listRouter);


const start = async () => {
  try {
    InitiateMongoServer();
    // const job = new CronJob(
    //   '0 0 0 * * *',
    //   () => {
    //     UpdateWatch();
    //   },
    //   null,
    //   true,
    //   'Europe/Copenhagen'
    // )
    app.listen(PORT, (req, res) => {
      console.log(`Server Started at PORT ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
}

start();