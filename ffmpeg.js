const { spawn } = require("child_process");
const path = require("path");
require("dotenv").config();

let ffmpegProcess = null;

function startStreaming() {
  if (ffmpegProcess) return;

  const gifPath = path.join(__dirname, "public", "idle.gif");
  const rtmpUrl = `${process.env.RTMP_URL}/${process.env.STREAM_KEY}?backup=1`;

const ffmpegProcess = spawn("ffmpeg", [
  "-stream_loop", "-1",            // Infinite loop of GIF
  "-re",                           // Read input in real time
  "-i", gifPath,                   // Input: your GIF
  "-an",                           // 🔇 No audio
  "-vf", "scale=426:240",          // 🖼️ 240p resolution
  "-c:v", "libx264",
  "-preset", "ultrafast",          // Lower CPU (or use "veryfast" if CPU OK)
  "-tune", "zerolatency",
  "-b:v", "200k",                  // 🎯 Video bitrate ~300 kbps
  "-maxrate", "300k",
  "-bufsize", "600k",
  "-g", "30",                      // 1 keyframe per second (30 fps)
  "-pix_fmt", "yuv420p",
  "-f", "flv",                     // Required for RTMP
  rtmpUrl                          // Your YouTube RTMP URL
]);

  ffmpegProcess.stderr.on("data", (data) => {
    console.log(`[FFmpeg] ${data}`);
  });

  ffmpegProcess.on("close", (code) => {
    console.log(`[FFmpeg] exited with code ${code}`);
    ffmpegProcess = null;

    // Auto-restart stream
    console.log("🔁 Restarting backup stream in 5 seconds...");
    setTimeout(startStreaming, 5000);
  });
}

function stopStreaming() {
  if (ffmpegProcess) {
    ffmpegProcess.kill("SIGINT");
    ffmpegProcess = null;
  }
}

module.exports = {
  startStreaming,
  stopStreaming,
};
