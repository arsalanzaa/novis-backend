const express = require("express");
const multer = require("multer");
const FormData = require("form-data");

const app = express();

app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage()
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "NOVIS Backend"
  });
});

app.post("/api/stt", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Audio file required"
      });
    }

    const form = new FormData();

    form.append("file", req.file.buffer, {
      filename: req.file.originalname || "audio.wav",
      contentType: req.file.mimetype || "audio/wav"
    });

    form.append("model", "whisper-large-v3-turbo");

    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          ...form.getHeaders()
        },
        body: form
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json({
      success: true,
      text: data.text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "STT failed",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NOVIS Backend running on port ${PORT}`);
});
