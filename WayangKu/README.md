# 🎭 WayangKu - Virtual Dalang Experience

**Status:** ✅ READY TO TEST!

## 🎯 Konsep:
Website kedua (anakan) - Langsung main wayang virtual sebagai dalang!

## ✨ Features:
1. **Hand Tracking** - Tangan lu = tongkat dalang (gapit)
2. **Real Wayang** - Gambar asli dari D:/Budaya/wayang-assets/
3. **Kelir Screen** - Layar backlit dengan golden glow
4. **Gamelan Sounds** - Gong, saron, kendang synthetic
5. **Atmospheric** - Smoke particles, dramatic lighting
6. **Control Rods** - 2 gapit mengikuti tangan
7. **Gesture Powers** - Peace, open, pinch effects

## 🚀 Cara Main:
1. **Buka:** http://localhost:8000/
2. **Pilih Wayang:** Click card (6 karakter tersedia)
3. **Mulai Pertunjukan:** Auto-request camera
4. **Main:** Gerakkan tangan → Wayang ikut!

## 📂 Files:
```
D:/WayangKu/
├── index.html
├── css/style.css
├── js/
│   ├── app.js          (Main logic)
│   ├── hand-tracker.js (MediaPipe)
│   ├── wayang-3d.js    (Three.js engine)
│   └── gamelan.js      (Sound system)
└── assets/             → D:/Budaya/wayang-assets/
```

## 🎭 Characters Available:
1. ⚔️ Gajah Mada
2. 🦅 Gatotkaca
3. 🎯 Arjuna
4. 🗡️ Hang Tuah
5. 🌊 Nyi Roro Kidul
6. 👑 Ken Arok

## 🖐️ Hand Controls:
- **Gerak tangan:** Wayang ikut posisi
- **Pinch (🤏):** Hold tight
- **Peace (✌️):** Spin attack
- **Open (🖐️):** Grow/energy
- **Point (👉):** Direct control

## 🎨 Visual Style:
- Dark mystical background
- Golden backlight (blencong)
- Floating particles (incense smoke)
- Dramatic rim lighting
- Real wayang textures (8m tall)
- Control rods visible

## 🔊 Audio:
- **Gong Ageng:** Opening/transitions
- **Saron:** Note triggers
- **Kendang:** Drum hits
- **Ambient:** Looping gamelan melody

## 🌐 Run Server:
```bash
cd D:/WayangKu
python -m http.server 8000
```

Then open: http://localhost:8000/

## ⚡ Next Steps:
1. **TEST** - Refresh browser & test controls
2. **Tune** - Adjust sensitivity & effects
3. **Link** - Add button to main website
4. **Polish** - More gestures, better shadows

---

**BUILD COMPLETE!** 🎉
Ready untuk jadi dalang virtual! 🎭✨
