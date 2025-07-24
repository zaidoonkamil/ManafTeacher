require("dotenv").config();
const express = require("express");
const sequelize = require("./config/db");
const usersRouter = require("./routes/user");
const adsRoutes = require("./routes/ads");
const courseRoutes = require("./routes/course");
const lessonRoutes = require("./routes/lesson");
const notifications = require("./routes/notifications.js");
const examRoutes = require('./routes/exam');


const app = express();
app.use(express.json());
app.use("/uploads", express.static("./" + "uploads"));


sequelize.sync({ force: true })
    .then(() => console.log("✅ Database & User table synced!"))
    .catch(err => console.error("❌ Error syncing database:", err));


app.use("/", usersRouter);
app.use("/", adsRoutes);
app.use("/", courseRoutes);
app.use("/", lessonRoutes);
app.use("/", notifications);
app.use("/", examRoutes);

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});