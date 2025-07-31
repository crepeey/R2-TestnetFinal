# R2 Testnet Auto Bot

Bot otomatis untuk R2 Testnet yang menggabungkan claim faucet dan auto swap dalam satu kali jalan dengan **behavior seperti manusia**.

## 🆕 Fitur Terbaru

✅ **Claim 24 Jam Sekali** - Claim faucet otomatis setiap 24 jam  
✅ **Human-like Swap** - Jumlah swap yang menyesuaikan seperti manusia  
✅ **Smart Delays** - Delay acak yang meniru perilaku manusia  
✅ **Claim Tracking** - Sistem tracking claim dengan file JSON  
✅ **Skip Swap** - Kadang skip swap (10% chance) seperti manusia  

## Fitur Utama

✅ **Claim Faucet Otomatis** - Mengambil token dari Discord bot secara otomatis  
✅ **Auto Swap Cerdas** - Menukar token dengan jumlah yang menyesuaikan sisa token  
✅ **Siklus Berkelanjutan** - Menjalankan claim dan swap secara berulang  
✅ **Delay Random** - Menghindari deteksi bot dengan delay acak  
✅ **Error Handling** - Menangani error dengan baik dan retry otomatis  
✅ **Logging Berwarna** - Output yang mudah dibaca dengan warna  

## Keamanan

🔒 **Testnet Only** - Hanya bekerja di jaringan testnet  
🔒 **Environment Variables** - Private key disimpan di file .env  
🔒 **Random Delays** - Delay acak untuk menghindari deteksi  
🔒 **Human-like Behavior** - Perilaku yang meniru manusia asli  

## Instalasi

1. **Install dependencies:**
```bash
npm install
```

2. **Buat file .env dengan konfigurasi berikut:**
```env
# Wallet Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia.infura.io/v3/your_project_id

# Token Addresses (Sepolia)
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
R2USD_ADDRESS=0x3e5c63644e683549055b9be8653de26e0b4cd36e
sR2USD_ADDRESS=0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419

# Token Addresses (Sepolia R2)
R2_ADDRESS=0x4200000000000000000000000000000000000006
R2_USDC_ADDRESS=0x176211869cA2b568f2A7D4EE941E073a821EE1ff
R2_R2USD_ADDRESS=0x3e5c63644e683549055b9be8653de26e0b4cd36e

# Discord Bot Token
DISCORD_TOKEN=your_discord_token_here
```

3. **Jalankan bot:**
```bash
./run.sh
```

## Cara Kerja

Bot akan menjalankan siklus berikut secara berkelanjutan:

### Siklus 1: Check & Claim Faucet (24 Jam)
- **Cek ketersediaan claim** berdasarkan waktu terakhir claim
- **Claim otomatis** jika sudah 24 jam sejak claim terakhir
- **Skip claim** jika belum waktunya, lanjut ke swap
- **Tracking waktu** disimpan di `last_claim.json`

### Siklus 2: Human-like Delay
- **Delay acak** seperti manusia: 5s-5min
- **Variasi delay**: Quick (30%), Normal (40%), Slow (20%), Very Slow (10%)

### Siklus 3: Human-like Swap
- **Jumlah swap acak**: Small (10-30%), Medium (30-60%), Large (60-90%)
- **Variasi ±5%** untuk membuat lebih natural
- **10% chance skip swap** seperti manusia yang kadang tidak swap
- **Berganti arah** otomatis setelah swap berhasil

### Siklus 4: Human-like Cycle Delay
- **Delay acak** sebelum siklus berikutnya
- **Mencegah spam** transaksi

## Human-like Behavior

### Swap Amount Distribution:
- **Small Swap (40%)**: 10-30% dari balance
- **Medium Swap (40%)**: 30-60% dari balance  
- **Large Swap (20%)**: 60-90% dari balance

### Delay Distribution:
- **Quick (30%)**: 5-15 detik
- **Normal (40%)**: 15-45 detik
- **Slow (20%)**: 45 detik - 2 menit
- **Very Slow (10%)**: 2-5 menit

### Human Patterns:
- **10% chance skip swap** - seperti manusia yang kadang tidak swap
- **Variasi ±5%** pada jumlah swap
- **Random delays** yang tidak predictable

## Monitoring

### Check Claim Status:
```bash
npm run check-claim
# atau
node check-claim.js
```

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

## Scripts Available

| Script | Command | Description |
|--------|---------|-------------|
| Auto Bot | `npm run auto` | Menjalankan bot otomatis |
| Check Claim | `npm run check-claim` | Cek status claim 24 jam |
| Starter | `npm run starter` | Menjalankan interactive starter |
| Development | `npm run dev` | Menjalankan auto bot dengan watch mode |
| Runner | `./run.sh` | Script runner dengan menu pilihan |

## File Tracking

### `last_claim.json`
File untuk tracking waktu claim terakhir:
```json
{
  "lastClaimTime": 1703123456789
}
```

### `logs/`
Folder untuk menyimpan log files:
- `combined.log` - Semua logs
- `out.log` - Output logs
- `error.log` - Error logs

## Troubleshooting

### Error: "DISCORD_TOKEN tidak ditemukan"
- Pastikan file `.env` ada dan berisi `DISCORD_TOKEN`
- Pastikan token Discord valid

### Error: "Failed to initialize wallet"
- Periksa `PRIVATE_KEY` dan `RPC_URL` di file `.env`
- Pastikan RPC endpoint berfungsi

### Error: "USDC balance too low"
- Bot akan menunggu claim faucet berikutnya
- Ini normal jika balance masih rendah

### Claim tidak tersedia
- Bot akan otomatis skip claim dan lanjut swap
- Cek status dengan: `npm run check-claim`

### Bot berhenti mendadak
- Gunakan `Ctrl+C` untuk menghentikan dengan aman
- Bot akan menyimpan state dan bisa di-restart

## Perbedaan dengan Script Asli

| Fitur | Script Asli | Auto Bot |
|-------|-------------|----------|
| Interface | UI Terminal (blessed) | Console Log |
| Claim | Manual/Interval | Otomatis 24 jam |
| Swap Amount | Random Range | Human-like ranges |
| Delays | Fixed ranges | Human-like delays |
| Behavior | Predictable | Random human patterns |
| Tracking | None | Claim time tracking |

## Disclaimer

⚠️ **PERINGATAN:**
- Script ini hanya untuk testnet
- Jangan gunakan private key wallet utama
- Gunakan dengan risiko sendiri
- Pastikan memahami cara kerja sebelum menggunakan

## Support

Untuk dukungan dan update terbaru:
- YouTube: @NTExhaust
- Telegram: @NTExhaust

---

**Don't forget to subscribe YT And Telegram @NTExhaust!!** 🚀 