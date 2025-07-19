const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const http = require("http");
const https = require("https");
const { startStreaming, stopStreaming } = require("./ffmpeg");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const SELF_URL = process.env.SELF_URL;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

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

app.listen(PORT, () => {
  console.log(`✅ Control panel running at http://localhost:${PORT}`);

  if (SELF_URL) {
    setInterval(() => {
      const url = new URL("/ping", SELF_URL);
      const protocol = url.protocol === "https:" ? https : http;

      protocol.get(url.toString(), (res) => {
        console.log(`⏳ Self-ping responded with status ${res.statusCode}`);
      }).on("error", (err) => {
        console.error("❌ Self-ping failed:", err.message);
      });
    }, 5 * 60 * 1000); // every 5 minutes
  } else {
    console.warn("⚠️ SELF_URL not defined. Self-ping is disabled.");
  }
});
