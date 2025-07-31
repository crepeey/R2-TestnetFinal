# R2 Testnet Bot - NT Exhaust

Bot untuk R2 Testnet dengan fitur claim faucet dan auto swap. Tersedia dalam dua versi: **Interactive UI** dan **Automated Bot**.

## 🚀 Versi Terbaru: Auto Bot

Bot otomatis yang menjalankan claim faucet dan swap dalam satu kali jalan dengan jumlah token yang menyesuaikan sisa token.

### Fitur Auto Bot:
- ✅ **Claim Faucet Otomatis** - Mengambil token dari Discord bot secara otomatis
- ✅ **Auto Swap Cerdas** - Menukar token dengan jumlah yang menyesuaikan sisa token (80% dari balance)
- ✅ **Siklus Berkelanjutan** - Menjalankan claim dan swap secara berulang
- ✅ **Delay Random** - Menghindari deteksi bot dengan delay acak
- ✅ **Error Handling** - Menangani error dengan baik dan retry otomatis
- ✅ **Logging Berwarna** - Output yang mudah dibaca dengan warna

### Cara Menjalankan Auto Bot:

1. **Setup environment:**
```bash
cp env.example .env
# Edit file .env dengan konfigurasi Anda
```

2. **Jalankan dengan script runner:**
```bash
./run.sh
```

3. **Atau jalankan langsung:**
```bash
npm run auto
# atau
node auto-bot.js
```

4. **Untuk development mode:**
```bash
npm run dev
```

## 🎮 Versi Original: Interactive UI

Bot dengan interface terminal interaktif menggunakan blessed library.

### Fitur Interactive UI:
- 🎯 **Menu Interaktif** - Interface terminal yang user-friendly
- 🔄 **Manual Control** - Kontrol penuh atas setiap aksi
- 📊 **Real-time Monitoring** - Monitoring balance dan transaksi real-time
- ⚙️ **Konfigurasi Fleksibel** - Pengaturan jumlah swap yang dapat disesuaikan

### Cara Menjalankan Interactive UI:

```bash
npm start
# atau
node index.js
```

## 📋 Instalasi

1. **Clone repository:**
```bash
git clone <repository-url>
cd R2FinalTestnet-NTE
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment:**
```bash
cp env.example .env
# Edit file .env dengan konfigurasi Anda
```

4. **Jalankan bot:**
```bash
# Auto Bot
./run.sh

# Interactive UI
npm start
```

## ⚙️ Konfigurasi

### File .env yang diperlukan:

```env
# Wallet Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia.infura.io/v3/your_project_id

# Discord Bot Token
DISCORD_TOKEN=your_discord_token_here

# Token Addresses (Sepolia)
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
R2USD_ADDRESS=0x3e5c63644e683549055b9be8653de26e0b4cd36e
sR2USD_ADDRESS=0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419

# Token Addresses (Sepolia R2)
R2_ADDRESS=0x4200000000000000000000000000000000000006
R2_USDC_ADDRESS=0x176211869cA2b568f2A7D4EE941E073a821EE1ff
R2_R2USD_ADDRESS=0x3e5c63644e683549055b9be8653de26e0b4cd36e
```

## 🔧 Scripts Available

| Script | Command | Description |
|--------|---------|-------------|
| Interactive UI | `npm start` | Menjalankan bot dengan interface terminal |
| Auto Bot | `npm run auto` | Menjalankan bot otomatis |
| Starter | `npm run starter` | Menjalankan interactive starter |
| Development | `npm run dev` | Menjalankan auto bot dengan watch mode |
| Runner | `./run.sh` | Script runner dengan menu pilihan |

## 📊 Monitoring

### Auto Bot Logs:
- Logs tersimpan di folder `logs/`
- Format: `[timestamp] [type] message`
- Warna: Cyan (info), Green (success), Yellow (warning), Red (error)

### PM2 Monitoring (Optional):
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 logs r2-auto-bot
pm2 status
```

## 🛡️ Keamanan

- 🔒 **Testnet Only** - Hanya bekerja di jaringan testnet
- 🔒 **Environment Variables** - Private key disimpan di file .env
- 🔒 **Random Delays** - Delay acak untuk menghindari deteksi
- 🔒 **Safe Amounts** - Hanya menggunakan 80% dari balance untuk swap

## 📈 Perbandingan Versi

| Fitur | Interactive UI | Auto Bot |
|-------|----------------|----------|
| Interface | Terminal UI (blessed) | Console Log |
| Claim | Manual/Interval | Otomatis setiap siklus |
| Swap Amount | Random Range | 80% dari balance |
| Kontrol | Menu interaktif | Otomatis penuh |
| Monitoring | Real-time UI | Console logs |
| Use Case | Development/Testing | Production/Automation |

## 🚨 Troubleshooting

### Error: "DISCORD_TOKEN tidak ditemukan"
- Pastikan file `.env` ada dan berisi `DISCORD_TOKEN`
- Pastikan token Discord valid

### Error: "Failed to initialize wallet"
- Periksa `PRIVATE_KEY` dan `RPC_URL` di file `.env`
- Pastikan RPC endpoint berfungsi

### Error: "USDC balance too low"
- Bot akan menunggu claim faucet berikutnya
- Ini normal jika balance masih rendah

### Bot berhenti mendadak
- Gunakan `Ctrl+C` untuk menghentikan dengan aman
- Bot akan menyimpan state dan bisa di-restart

## ⚠️ Disclaimer

**PERINGATAN:**
- Script ini hanya untuk testnet
- Jangan gunakan private key wallet utama
- Gunakan dengan risiko sendiri
- Pastikan memahami cara kerja sebelum menggunakan

## 📞 Support

Untuk dukungan dan update terbaru:
- **YouTube:** @NTExhaust
- **Telegram:** @NTExhaust

---

**Don't forget to subscribe YT And Telegram @NTExhaust!!** 🚀
