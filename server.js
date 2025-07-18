const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const { startStreaming, stopStreaming } = require("./ffmpeg");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
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

app.listen(PORT, () => {
  console.log(`✅ Control panel running at http://localhost:${PORT}`);
});
