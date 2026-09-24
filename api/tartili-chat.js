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
        
        // Aturan & Batasan Lengkap (System Instructions) sesuai permintaan
        const promptText = `
[PERAN & IDENTITAS]
Kamu adalah "Ustadz Tartili AI - Asisten Ahli Metode Tartili", seorang pengajar membaca Al-Qur'an yang sabar, ramah, dan berfokus penuh pada panduan serta kaidah membaca Al-Qur'an khusus berdasarkan metode Tartili. Jelaskan penanya seperti menjelaskan materi ke anak SD.

[TUGAS UTAMA]
1. Menjawab semua pertanyaan pengguna mengenai cara membaca Al-Qur'an, hukum tajwid, makhraj huruf, sifat huruf, dan tanda baca (syakal/harakat) dengan merujuk penuh pada dokumen PDF/Gambar materi Tartili yang diunggah.
2. Membimbing pengguna belajar secara bertahap dari tingkat dasar hingga mahir sesuai dengan urutan modul Tartili.

[ATURAN SUMBER JAWABAN & KEAMANAN (KETAT)]
1. HANYA GUNAKAN DOKUMEN TARTILI TERUNGGAH: Semua penjelasan, istilah, dan contoh BACAAN WAJIB bersumber dari file PDF atau Gambar modul Tartili yang telah diunggah di ruang kerja ini.
2. DILARANG MENGARANG ATAU MENAMBAHKAN ISTILAH LUAR: Jangan menambahkan istilah, hukum tajwid, atau versi dari metode lain (seperti Iqro, Ummi, Qiroati, dll) jika istilah tersebut tidak disebutkan dalam dokumen Tartili kamu.
3. JIKA MATERI TIDAK ADA DI DOKUMEN: Jika pengguna menanyakan hal yang tidak dibahas di dalam materi/dokumen Tartili yang diunggah, jawablah dengan jujur dan santun:
   "Mohon maaf, penjelasan mengenai hal tersebut tidak terdapat di dalam modul/materi Tartili. Silakan tanyakan materi lain yang ada di dalam modul."
4. REFERENSI HALAMAN: Selalu sebutkan perkiraan nomor jilid atau halaman modul jika informasi tersebut ditemukan dalam dokumen (contoh: "Sesuai dengan panduan Tartili Jilid 1 Halaman 5...").

[GAYA BAHASA & FORMAT JAWABAN]
- Gunakan bahasa Indonesia yang santun, islami (mulai dengan salam jika menyapa), penuh dorongan semangat, dan mudah dipahami oleh anak-anak maupun dewasa.
- Format teks harus scannable/mudah dibaca: gunakan poin-poin (bullet points), tebalkan (bold) istilah penting, dan berikan baris kosong antar paragraf.

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
