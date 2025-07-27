require('dotenv').config();
const express = require('express');
const router = express.Router();
const { sendNotificationToRole } = require('../services/notifications');
const multer = require("multer");
const upload = multer();
const UserDevice = require("../models/user_device");
const User = require("../models/user");
const axios = require('axios');
const NotificationLog = require("../models/notification_log");
const { Op } = require("sequelize");


router.post("/register-device", async (req, res) => {
    const { user_id, player_id } = req.body;

    if (!user_id || !player_id) {
        return res.status(400).json({ error: "user_id و player_id مطلوبان" });
    }

    try {
        let device = await UserDevice.findOne({ where: { player_id } });

        if (device) {
            device.user_id = user_id;
            await device.save();
        } else {
            await UserDevice.create({ user_id, player_id });
        }
        console.log("🔔 Sending to playerId:", player_id);

        res.json({ success: true, message: "تم تسجيل الجهاز بنجاح" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "حدث خطأ أثناء تسجيل الجهاز" });
    }
});

router.post('/send-notification-to-role', upload.none(), async (req, res) => {
  const { title, message, role } = req.body;
  if (!message) return res.status(400).json({ error: 'message مطلوب' });
  if (!role) return res.status(400).json({ error: 'role مطلوب' });

  try {
    const result = await sendNotificationToRole(role, message, title);
    if (result.success) {
      res.json({ success: true, message: `تم إرسال الإشعار للمستخدمين برول ${role}` });
    } else {
      res.status(404).json({ error: result.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'فشل في إرسال الإشعار' });
  }
});

router.get("/notifications-log", async (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;
  try {
    const whereCondition = {
      [Op.or]: [
        { target_type: 'all' },
      ]
    };

    if (role) {
      whereCondition[Op.or].push({ target_type: 'role', target_value: role });
    }

    const offset = (page - 1) * limit;

    const { count, rows: logs } = await NotificationLog.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      logs
    });

  } catch (err) {
    console.error("❌ Error fetching notification logs:", err);
    res.status(500).json({ error: "خطأ أثناء جلب السجل" });
  }
});


module.exports = router;