const { spawn } = require("child_process");
const path = require("path");
require("dotenv").config();

let ffmpegProcess = null;

function startStreaming() {
  if (ffmpegProcess) return;

  const gifPath = path.join(__dirname, "public", "idle.gif");
  const rtmpUrl = `${process.env.RTMP_URL}/${process.env.STREAM_KEY}?backup=1`;

  ffmpegProcess = spawn("ffmpeg", [
    "-stream_loop", "-1",           // Loop GIF infinitely
    "-re",                          // Read input in real-time
    "-i", gifPath,                  // Input file (GIF)
    "-an",                          // Disable audio entirely (no need for anullsrc)
    "-vf", "scale=426:240",         // 240p resolution to reduce bandwidth
    "-c:v", "libx264",
    "-preset", "ultrafast",         // Lower CPU usage
    "-tune", "zerolatency",         // For low latency streaming
    "-b:v", "300k",                 // Set video bitrate
    "-maxrate", "300k",
    "-bufsize", "600k",
    "-g", "30",                     // GOP size for keyframe every 1 second
    "-pix_fmt", "yuv420p",          // Required by YouTube
    "-f", "flv",                    // Output format
    rtmpUrl                         // YouTube RTMP stream URL
  ]);

  ffmpegProcess.stderr.on("data", (data) => {
    console.log(`[FFmpeg] ${data}`);
  });

  ffmpegProcess.on("close", (code) => {
    console.log(`[FFmpeg] exited with code ${code}`);
    ffmpegProcess = null;

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
