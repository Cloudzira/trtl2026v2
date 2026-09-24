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
        // Sesuaikan dengan nama model yang aktif di AI Studio kamu
        const modelName = "gemini-3.8-flash"; 
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: `Berdasarkan dokumen PDF Buku Tartili Jilid 1 yang telah diunggah, jawablah pertanyaan berikut dengan akurat dan informatif: ${message}` }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            return res.status(200).json({ reply: "Maaf, AI tidak dapat membaca isi dokumen saat ini." });
        }

        const reply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: reply });

    } catch (error) {
        return res.status(500).json({ error: 'Gagal terhubung ke Gemini AI: ' + error.message });
    }
}
