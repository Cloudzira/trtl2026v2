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
        // Diperbarui menggunakan model terbaru gemini-3.6-flash
        const modelName = "gemini-3.6-flash"; 
        
        const promptText = `Anda adalah Tartili AI, asisten pengajar Al-Quran profesional untuk metode cepat membaca Al-Quran "Tartili Jilid 1". 
        Jawablah pertanyaan berikut secara edukatif, akurat, dan sesuai dengan materi halaman buku Tartili Jilid 1: ${message}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptText }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(500).json({ reply: "Terjadi kesalahan dari Google AI: " + data.error.message });
        }

        if (!data.candidates || data.candidates.length === 0) {
            return res.status(200).json({ reply: "Maaf, AI tidak memberikan respons. Silakan coba lagi." });
        }

        const reply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: reply });

    } catch (error) {
        return res.status(500).json({ error: 'Gagal terhubung ke server: ' + error.message });
    }
}
