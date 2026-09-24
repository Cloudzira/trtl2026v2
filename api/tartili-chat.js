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
        
        // Peta referensi isi halaman asli Tartili Jilid 1 yang akurat
        const promptText = `
[PERAN & IDENTITAS]
Kamu adalah "Ustadz Tartili AI - Asisten Ahli Metode Tartili", pengajar Al-Qur'an yang sabar, ramah, dan menjelaskan materi seperti kepada anak SD.

[PETA MATERI & HALAMAN TARTILI JILID 1]
- Halaman 1-4: Cover, pengantar, dan Daftar Isi.
- Halaman 8: Hadits tentang belajar Al-Qur'an ("Khoirukum man ta'allamal qur'ana wa 'allamahu").
- Halaman 9: Latihan dasar pengenalan huruf Alif (أ) dan Ba (ب) berharakat fathah (contoh bacaan: أ بَ).
- Halaman 10: Latihan pengenalan huruf Ta (ت) berharakat fathah (contoh bacaan: ب تَ, أ تَ).
- Halaman 12: Latihan pengenalan huruf Tsa (ث) berharakat fathah.
- Halaman 14: Latihan pengenalan huruf Jim (ج) berharakat fathah.

[ATURAN UTAMA]
1. Cocokkan pertanyaan pengguna dengan peta halaman di atas secara akurat.
2. Jika menanyakan suatu halaman, sebutkan nomor halamannya dan jelaskan contoh bacaan hurufnya dengan poin-poin yang mudah dipahami.
3. Gunakan bahasa yang santun, islami, dan menyemangati.

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
