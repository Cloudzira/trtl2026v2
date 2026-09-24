export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key belum disetel di server.' });
    }

    try {
        const modelName = "gemini-2.5-flash"; // Sesuaikan dengan model yang kamu gunakan
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Berdasarkan dokumen PDF Tartili yang telah diunggah dan tersimpan, jawablah pertanyaan berikut dengan akurat: ${message}` }]
                }]
            })
        });

        const data = await response.json();
        const reply = data.candidates[0].content.parts[0].text;

        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(500).json({ error: 'Gagal terhubung ke Gemini AI.' });
    }
}
