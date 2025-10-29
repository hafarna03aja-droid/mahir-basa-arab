<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Mahir Bahasa Arab - AI Language Learning App

Aplikasi pembelajaran bahasa Arab berbasis AI yang menggunakan Google Gemini untuk memberikan pengalaman belajar yang interaktif dan personal.

## 🚀 Fitur Utama

- **AI Companion**: Asisten pembelajaran AI yang membantu belajar bahasa Arab
- **Audio Translator**: Menerjemahkan audio ke bahasa Arab dan sebaliknya
- **Grammar Helper**: Bantuan tata bahasa Arab dengan AI
- **Vocabulary Builder**: Pembangunan kosakata dengan sistem spaced repetition
- **Translation Practice**: Latihan menerjemahkan dengan feedback AI

## 📋 Prerequisites

- **Node.js** (versi 18 atau lebih baru)
- **NPM** atau **Yarn**
- **Gemini API Key** - Dapatkan dari [Google AI Studio](https://ai.google.dev/)

## 🏃‍♂️ Menjalankan Secara Lokal

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
1. Salin file `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local` dan masukkan Gemini API key Anda:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### 4. Build untuk Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

## 🚀 Deployment

### Deploy ke Vercel

1. **Setup Project di Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set Environment Variables**:
   - Buka dashboard Vercel
   - Pergi ke Settings > Environment Variables
   - Tambahkan `GEMINI_API_KEY` dengan value API key Anda

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Deploy ke Netlify

1. **Build Project**:
   ```bash
   npm run build
   ```

2. **Deploy via CLI**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir dist
   ```

3. **Set Environment Variables**:
   - Buka dashboard Netlify
   - Pergi ke Site Settings > Environment Variables
   - Tambahkan `GEMINI_API_KEY`

### Deploy dengan Docker

1. **Build Docker Image**:
   ```bash
   docker build -t mahir-arab .
   ```

2. **Run Container**:
   ```bash
   docker run -p 80:80 mahir-arab
   ```

3. **Atau menggunakan Docker Compose**:
   ```bash
   # Development
   docker-compose up mahir-arab-dev
   
   # Production
   docker-compose up mahir-arab-prod
   ```

### Deploy ke GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script ke package.json**:
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Build dan Deploy**:
   ```bash
   npm run build
   npm run deploy
   ```

## 🔧 Konfigurasi Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | API key untuk Google Gemini | ✅ |

## 📁 Struktur Project

```
├── components/          # React components
│   ├── AICompanion.tsx
│   ├── AudioTranslator.tsx
│   ├── GrammarHelper.tsx
│   └── ...
├── contexts/           # React contexts
├── services/          # API services
├── utils/            # Utility functions
├── .env.local        # Environment variables (local)
├── .env.example      # Template environment variables
├── Dockerfile        # Docker configuration
├── vercel.json       # Vercel deployment config
├── netlify.toml      # Netlify deployment config
└── docker-compose.yml # Docker Compose config
```

## 🛠 Scripts yang Tersedia

- `npm run dev` - Jalankan development server
- `npm run build` - Build untuk production
- `npm run preview` - Preview production build
- `npm run serve` - Serve production build dengan host 0.0.0.0

## 🔗 Links

- **AI Studio App**: https://ai.studio/apps/drive/1NuJmmheXHZSaQ1FGemrhOAi2OpWs1t2g
- **Google Gemini API**: https://ai.google.dev/
- **React Documentation**: https://react.dev/
- **Vite Documentation**: https://vitejs.dev/

## 📝 Catatan Deployment

1. **API Key Security**: Pastikan API key tidak pernah di-commit ke repository
2. **Environment Variables**: Set environment variables sesuai platform deployment
3. **Build Optimization**: Production build sudah dioptimasi untuk performa terbaik
4. **CORS**: Aplikasi ini adalah client-side app, pastikan API endpoint mendukung CORS

## 🤝 Contributing

1. Fork repository
2. Buat feature branch
3. Commit perubahan Anda
4. Push ke branch
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
