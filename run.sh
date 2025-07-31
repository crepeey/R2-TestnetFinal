#!/bin/bash

# R2 Testnet Auto Bot Runner
# Don't forget to subscribe YT And Telegram @NTExhaust!!

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error "❌ File .env tidak ditemukan!"
    print_warning "Buat file .env terlebih dahulu dengan mengcopy env.example"
    echo "cp env.example .env"
    exit 1
fi

# Function to show menu
show_menu() {
    clear
    echo "🤖 R2 Testnet Auto Bot Runner"
    echo "=============================="
    echo ""
    echo "Pilih mode operasi:"
    echo "1. 🚀 Mode Otomatis (Claim + Swap)"
    echo "2. 🎯 Mode Starter (Interactive)"
    echo "3. 📊 Cek Balance"
    echo "4. 🔧 Test Connection"
    echo "5. ⏰ Cek Status Claim"
    echo "6. 📝 View Logs"
    echo "7. 🛑 Stop Bot (PM2)"
    echo "8. ❌ Keluar"
    echo ""
}

# Function to run auto mode
run_auto_mode() {
    print_status "🚀 Memulai R2 Auto Bot..."
    print_warning "Tekan Ctrl+C untuk menghentikan bot"
    echo ""
    node auto-bot.js
}

# Function to run starter mode
run_starter_mode() {
    print_status "🎯 Memulai Interactive Starter..."
    node start-bot.js
}

# Function to check balance
check_balance() {
    print_status "📊 Mengecek balance wallet..."
    node -e "
import 'dotenv/config';
import { ethers } from 'ethers';

async function checkBalance() {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        const ethBalance = await provider.getBalance(wallet.address);
        console.log('Wallet:', wallet.address);
        console.log('ETH Balance:', ethers.formatEther(ethBalance), 'ETH');
        
        if (process.env.USDC_ADDRESS) {
            const usdcContract = new ethers.Contract(process.env.USDC_ADDRESS, [
                'function balanceOf(address owner) view returns (uint256)',
                'function decimals() view returns (uint8)'
            ], provider);
            
            const usdcBalance = await usdcContract.balanceOf(wallet.address);
            const usdcDecimals = await usdcContract.decimals();
            console.log('USDC Balance:', ethers.formatUnits(usdcBalance, usdcDecimals), 'USDC');
        }
        
        if (process.env.R2USD_ADDRESS) {
            const r2usdContract = new ethers.Contract(process.env.R2USD_ADDRESS, [
                'function balanceOf(address owner) view returns (uint256)',
                'function decimals() view returns (uint8)'
            ], provider);
            
            const r2usdBalance = await r2usdContract.balanceOf(wallet.address);
            const r2usdDecimals = await r2usdContract.decimals();
            console.log('R2USD Balance:', ethers.formatUnits(r2usdBalance, r2usdDecimals), 'R2USD');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkBalance();
"
}

# Function to test connection
test_connection() {
    print_status "🔧 Testing connections..."
    node -e "
import 'dotenv/config';
import { ethers } from 'ethers';

async function testConnection() {
    try {
        console.log('Testing RPC connection...');
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const blockNumber = await provider.getBlockNumber();
        console.log('✅ RPC Connected - Block:', blockNumber);
        
        console.log('Testing wallet connection...');
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const balance = await provider.getBalance(wallet.address);
        console.log('✅ Wallet Connected - Address:', wallet.address);
        console.log('✅ Balance:', ethers.formatEther(balance), 'ETH');
        
        console.log('Testing Discord token...');
        if (process.env.DISCORD_TOKEN) {
            console.log('✅ Discord token configured');
        } else {
            console.log('❌ Discord token not found');
        }
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
    }
}

testConnection();
"
}

# Function to check claim status
check_claim_status() {
    print_status "⏰ Mengecek status claim..."
    node check-claim.js
}

# Function to view logs
view_logs() {
    if [ -f "logs/combined.log" ]; then
        print_status "📝 Menampilkan logs terbaru..."
        echo "=== Last 50 lines of logs ==="
        tail -n 50 logs/combined.log
    else
        print_warning "📝 Tidak ada log file ditemukan"
        echo "Logs akan dibuat saat menjalankan bot dengan PM2"
    fi
}

# Function to stop PM2 bot
stop_pm2_bot() {
    print_status "🛑 Stopping PM2 bot..."
    if command -v pm2 &> /dev/null; then
        pm2 stop r2-auto-bot
        pm2 delete r2-auto-bot
        print_success "✅ Bot stopped"
    else
        print_warning "⚠️  PM2 not installed. Install with: npm install -g pm2"
    fi
}

# Main menu loop
while true; do
    show_menu
    read -p "Masukkan pilihan (1-8): " choice
    
    case $choice in
        1)
            run_auto_mode
            ;;
        2)
            run_starter_mode
            ;;
        3)
            check_balance
            echo ""
            read -p "Tekan Enter untuk kembali ke menu..."
            ;;
        4)
            test_connection
            echo ""
            read -p "Tekan Enter untuk kembali ke menu..."
            ;;
        5)
            check_claim_status
            echo ""
            read -p "Tekan Enter untuk kembali ke menu..."
            ;;
        6)
            view_logs
            echo ""
            read -p "Tekan Enter untuk kembali ke menu..."
            ;;
        7)
            stop_pm2_bot
            echo ""
            read -p "Tekan Enter untuk kembali ke menu..."
            ;;
        8)
            print_success "👋 Sampai jumpa!"
            exit 0
            ;;
        *)
            print_error "❌ Pilihan tidak valid!"
            sleep 2
            ;;
    esac
done 