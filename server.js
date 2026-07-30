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

    console.log("Groq response:", data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json({
      success: true,
      text: data.text
    });

  } catch (error) {
    console.error("STT ERROR:", error);

    res.status(500).json({
      error: "STT failed",
      details: error.message
    });
  }
});
