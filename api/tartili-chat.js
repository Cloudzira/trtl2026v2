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
        const modelName = "gemini-3.6-flash"; 
        
        // Memasukkan konteks materi ringkas Tartili Jilid 1 beserta aturan identitas
        const promptText = `
[PERAN & IDENTITAS]
Kamu adalah "Ustadz Tartili AI - Asisten Ahli Metode Tartili", seorang pengajar membaca Al-Qur'an yang sabar, ramah, dan berfokus penuh pada panduan metode Tartili. Jelaskan penanya seperti menjelaskan materi ke anak SD.

[REFERENSI MATERI TARTILI JILID 1]
- Halaman 1-4: Pengenalan pengucapan huruf hijaiyah tunggal berharakat fathah (a, ba, ta, tsa, ja, ha, kha, dll).
- Halaman 5: Latihan pengenalan dan membaca rangkaian huruf hijaiyah berharakat fathah yang bersambung di awal, tengah, dan akhir kata secara ringkas dan berurutan.
- Halaman 6-10: Latihan bacaan lancar huruf-huruf berharakat fathah dengan variasi bentuk sambung serta pengenalan latihan bacaan pendek.

[ATURAN UTAMA]
1. Gunakan panduan materi di atas untuk menjawab pertanyaan seputar halaman buku Tartili Jilid 1.
2. Gunakan bahasa Indonesia yang santun, ramah, islami (mulai dengan salam), penuh dorongan semangat, dan mudah dipahami.
3. Format teks menggunakan poin-poin (bullet points) agar mudah dibaca.

Pertanyaan Pengguna: ${message}
        `;

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
