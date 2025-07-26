require("dotenv").config();
require('./models'); 
const express = require("express");
const sequelize = require("./config/db");
const usersRouter = require("./routes/user");
const adsRoutes = require("./routes/ads");
const courseRoutes = require("./routes/course");
const lessonRoutes = require("./routes/lesson");
const notifications = require("./routes/notifications.js");
const examRoutes = require('./routes/exam');
const gradesRoutes = require('./routes/grades');
const { TextExamAnswer } = require('./models');

TextExamAnswer.findAll({
  include: [{ association: 'user', attributes: ['id', 'name'] }]
}).then(res => console.log("✅ العلاقات تعمل")).catch(err => console.log("❌ فشل", err.message));


const app = express();
app.use(express.json());
app.use("/uploads", express.static("./" + "uploads"));


sequelize.sync({ alter: true })
    .then(() => console.log("✅ Database & User table synced!"))
    .catch(err => console.error("❌ Error syncing database:", err));


app.use("/", usersRouter);
app.use("/", adsRoutes);
app.use("/", courseRoutes);
app.use("/", lessonRoutes);
app.use("/", notifications);
app.use("/", examRoutes);
app.use("/", gradesRoutes);

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});