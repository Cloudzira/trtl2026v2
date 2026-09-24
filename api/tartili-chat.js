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
        const modelName = "gemini-3.8-flash"; 
        
        // Kita berikan instruksi sistem/konteks dasar buku Tartili Jilid 1 di sini
        const systemPrompt = `Anda adalah Tartili AI, asisten pengajar Al-Quran yang ahli dalam metode cepat membaca Al-Quran buku "Tartili Jilid 1". 
        Jawablah pertanyaan pengguna berdasarkan isi materi Tartili Jilid 1 (yang membahas pengenalan huruf hijaiyah berbaris fathah, sambung, dan latihan membaca halaman per halaman secara runut).
        Pertanyaan pengguna: ${message}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            return res.status(200).json({ reply: "Maaf, AI sedang sibuk. Silakan coba tanyakan kembali." });
        }

        const reply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: reply });

    } catch (error) {
        return res.status(500).json({ error: 'Gagal terhubung ke Gemini AI: ' + error.message });
    }
}
