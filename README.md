# 💸 Well Spent — HackTX 2025

### *A mindful way to spend.*  
**Well Spent** is a financial tracker that connects spending habits with emotional well-being. Using AI, it analyzes your emotional and financial data to uncover patterns that influence your behavior — helping you become a more mindful and emotionally intelligent consumer.

---

## About

**Well Spent** is a full-stack project built for **HackTX 2025** that seamlessly integrates financial tracking and emotional analysis.  
It leverages **Gemini AI** to interpret correlations between a user’s mood and their spending patterns, helping them identify triggers behind impulsive purchases and build healthier financial habits.

Through a clean mobile interface and a connected backend, users can log emotions, monitor transactions, and receive AI-driven recommendations to manage both money and mind more effectively.

---

## Video Demo

*Coming soon*

---

## Tech Stack

**Frontend:**  
- Expo / React Native  
- TypeScript  
- React Navigation  

**Backend:**  
- Node.js  
- TypeScript  
- Express  
- Gemini AI  
- Nessie API (Capital One)

**Database:**  
- Firebase (Authentication)  
- Cloudflare D1  
- Nessie  

**Tools & Libraries:**  
- npm / Yarn  
- ngrok (for exposing backend to Expo Go)  
- dotenv for environment configuration  

**AI Tools Used During Development:**  
- Cursor  
- GitHub Copilot  
- ChatGPT

---

## Repository Structure

```
hacktx25/
│
├── backend/          # Node.js + TypeScript server + Database
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/         # Expo React Native mobile app
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── app.json
│
├── .gitignore
└── README.md
```

---

## Requirements

- **Node.js** v16+ (v18 recommended)  
- **npm** or **Yarn**  
- **Expo CLI** (`npm install -g expo-cli` or use `npx expo start`)  
- **ngrok** *(optional, for connecting the mobile app to the local backend)*

---

## Setup & Run (Local)

### Backend (Server)

```bash
cd backend
npm install
npm run dev   # or: npm start
```

If using TypeScript compilation:

```bash
npm run build
node dist/index.js
```

If testing on Expo Go, expose the backend to your phone with ngrok:

```bash
# Example: expose port 3000
ngrok http 3000
```

### Frontend (Expo App)

```bash
cd ../frontend
npm install
npx expo start
```

Scan the QR code with **Expo Go** (on iOS or Android).  
If the backend runs locally, update your frontend `.env` or config to use either:
- Your **LAN IP** (`http://192.168.x.x:3000`), or  
- The **ngrok URL** generated earlier.

---

## Environment Variables

Create `.env` files in both `backend` and `frontend` directories.

**Example — backend/.env**
```
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
```

**Example — frontend/.env**
```
API_BASE_URL=https://<your-ngrok-url>
EXPO_PUBLIC_API_KEY=your_api_key
```

---

## API

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/api/auth/login` | Authenticate a user |
| `GET`  | `/api/spending`  | Retrieve user’s spending history |
| `POST` | `/api/emotion`  | Log user emotion data |
| `GET`  | `/api/insights` | Return AI-driven spending insights |

---

## Development Notes & Troubleshooting

- **Expo Go not connecting?**  
  Replace `localhost` with your machine’s IP or use ngrok.
- **TypeScript errors?**  
  Ensure both frontend and backend include valid `tsconfig.json` files.
- **Dependencies missing?**  
  Run `npm install` inside both `frontend` and `backend` folders.
- **Expo cache issues?**  
  Run `npx expo start -c` to clear cache.

---

## Credits

Developed for **HackTX 2025** by:  
- [Aryan Verma](https://github.com/aryanjverma)  
- [Abhilash Sunkara](https://github.com/abhilash-sunkara)  
- [Indrajith Thyagaraja (Braindeeeaad)](https://github.com/Braindeeeaad)  
- [Rishi Sakhamuri](https://github.com/RishiSakhamuri)

---

## License

MIT License  

Copyright (c) 2025 Aryan Verma, Abhilash Sunkara,  
Indrajith Thyagaraja, and Rishi Sakhamuri.

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the “Software”), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in  
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN  
THE SOFTWARE.

---

_Repository link:_ [https://github.com/Braindeeeaad/hacktx25](https://github.com/Braindeeeaad)
