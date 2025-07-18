const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const http = require("http");
const { startStreaming, stopStreaming } = require("./ffmpeg");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Health route to prevent sleeping
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/control", (req, res) => {
  const { password, action } = req.body;

  if (password !== process.env.PASSWORD) {
    return res.status(403).send("❌ Incorrect password.");
  }

  if (action === "start") {
    startStreaming();
    return res.send("✅ Backup stream started.");
  } else if (action === "stop") {
    stopStreaming();
    return res.send("🛑 Backup stream stopped.");
  } else {
    return res.status(400).send("⚠️ Invalid action.");
  }
});

// Self-ping every 14 minutes to prevent Render sleeping
app.listen(PORT, () => {
  console.log(`✅ Control panel running at http://localhost:${PORT}`);

  setInterval(() => {
    http.get(`http://localhost:${PORT}/ping`);
    console.log("⏳ Self-ping sent to keep app alive.");
  }, 5 * 60 * 1000); // every 5 minutes
});
