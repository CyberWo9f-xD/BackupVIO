const { spawn } = require("child_process");
const path = require("path");
require("dotenv").config();

let ffmpegProcess = null;

function startStreaming() {
  if (ffmpegProcess) return;

  const gifPath = path.join(__dirname, "public", "idle.gif");
  const rtmpUrl = `${process.env.RTMP_URL}/${process.env.STREAM_KEY}?backup=1`;

  ffmpegProcess = spawn("ffmpeg", [
    "-stream_loop", "-1",
    "-re",
    "-i", gifPath,
    "-f", "lavfi",
    "-i", "anullsrc",
    "-shortest",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-tune", "zerolatency",
    "-c:a", "aac",
    "-b:a", "128k",
    "-ar", "44100",
    "-pix_fmt", "yuv420p",
    "-f", "flv",
    rtmpUrl,
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
