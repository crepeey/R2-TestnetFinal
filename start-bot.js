#!/usr/bin/env node

import readline from 'readline';
import { spawn } from 'child_process';
import fs from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function log(message, type = "info") {
  const colors = {
    info: "\x1b[36m",
    success: "\x1b[32m", 
    warning: "\x1b[33m",
    error: "\x1b[31m",
    reset: "\x1b[0m"
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

async function checkEnvironment() {
  if (!fs.existsSync('.env')) {
    log("❌ File .env tidak ditemukan!", "error");
    log("Buat file .env terlebih dahulu dengan konfigurasi yang diperlukan.", "warning");
    return false;
  }
  
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredVars = ['PRIVATE_KEY', 'RPC_URL', 'DISCORD_TOKEN'];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(`${varName}=`)) {
      log(`❌ Variable ${varName} tidak ditemukan di .env`, "error");
      return false;
    }
  }
  
  log("✅ Environment variables sudah dikonfigurasi", "success");
  return true;
}

async function showMenu() {
  console.clear();
  log("🤖 R2 Testnet Auto Bot Starter", "info");
  log("=====================================", "info");
  console.log();
  
  log("Pilih mode operasi:", "info");
  log("1. 🚀 Mode Otomatis (Claim + Swap)", "info");
  log("2. ⚙️  Mode Konfigurasi", "info");
  log("3. 📊 Cek Balance", "info");
  log("4. 🔧 Test Connection", "info");
  log("5. ❌ Keluar", "info");
  console.log();
  
  const choice = await question("Masukkan pilihan (1-5): ");
  
  switch (choice) {
    case '1':
      await startAutoMode();
      break;
    case '2':
      await configMode();
      break;
    case '3':
      await checkBalance();
      break;
    case '4':
      await testConnection();
      break;
    case '5':
      log("👋 Sampai jumpa!", "success");
      rl.close();
      process.exit(0);
      break;
    default:
      log("❌ Pilihan tidak valid!", "error");
      await delay(2000);
      await showMenu();
  }
}

async function startAutoMode() {
  console.clear();
  log("🚀 Mode Otomatis", "info");
  log("=================", "info");
  console.log();
  
  log("Bot akan menjalankan siklus claim dan swap secara otomatis.", "info");
  log("Tekan Ctrl+C untuk menghentikan bot.", "warning");
  console.log();
  
  const confirm = await question("Lanjutkan? (y/n): ");
  
  if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
    log("🚀 Memulai bot...", "success");
    console.log();
    
    // Spawn the auto bot process
    const botProcess = spawn('node', ['auto-bot.js'], {
      stdio: 'inherit',
      detached: false
    });
    
    botProcess.on('error', (error) => {
      log(`❌ Error menjalankan bot: ${error.message}`, "error");
    });
    
    botProcess.on('exit', (code) => {
      if (code !== 0) {
        log(`❌ Bot berhenti dengan kode: ${code}`, "error");
      } else {
        log("✅ Bot berhenti dengan normal", "success");
      }
      rl.close();
    });
    
  } else {
    log("❌ Dibatalkan", "warning");
    await delay(2000);
    await showMenu();
  }
}

async function configMode() {
  console.clear();
  log("⚙️  Mode Konfigurasi", "info");
  log("===================", "info");
  console.log();
  
  log("Konfigurasi bot parameters:", "info");
  console.log();
  
  const swapPercent = await question("Persentase swap (0.1-0.9, default: 0.8): ");
  const cycleDelay = await question("Delay antar siklus dalam detik (30-120, default: 45): ");
  
  // Create config file
  const config = {
    swapPercent: parseFloat(swapPercent) || 0.8,
    cycleDelay: parseInt(cycleDelay) || 45,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('bot-config.json', JSON.stringify(config, null, 2));
  
  log("✅ Konfigurasi disimpan ke bot-config.json", "success");
  console.log();
  
  const startNow = await question("Jalankan bot sekarang? (y/n): ");
  
  if (startNow.toLowerCase() === 'y' || startNow.toLowerCase() === 'yes') {
    await startAutoMode();
  } else {
    await delay(2000);
    await showMenu();
  }
}

async function checkBalance() {
  console.clear();
  log("📊 Cek Balance", "info");
  log("==============", "info");
  console.log();
  
  try {
    // Import and run balance check
    const { ethers } = await import('ethers');
    const dotenv = await import('dotenv/config');
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const ethBalance = await provider.getBalance(wallet.address);
    
    log(`Wallet: ${wallet.address}`, "info");
    log(`ETH Balance: ${ethers.formatEther(ethBalance)} ETH`, "success");
    console.log();
    
    // Check token balances if addresses are configured
    if (process.env.USDC_ADDRESS) {
      const usdcContract = new ethers.Contract(process.env.USDC_ADDRESS, [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ], provider);
      
      const usdcBalance = await usdcContract.balanceOf(wallet.address);
      const usdcDecimals = await usdcContract.decimals();
      log(`USDC Balance: ${ethers.formatUnits(usdcBalance, usdcDecimals)} USDC`, "success");
    }
    
    if (process.env.R2USD_ADDRESS) {
      const r2usdContract = new ethers.Contract(process.env.R2USD_ADDRESS, [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ], provider);
      
      const r2usdBalance = await r2usdContract.balanceOf(wallet.address);
      const r2usdDecimals = await r2usdContract.decimals();
      log(`R2USD Balance: ${ethers.formatUnits(r2usdBalance, r2usdDecimals)} R2USD`, "success");
    }
    
  } catch (error) {
    log(`❌ Error cek balance: ${error.message}`, "error");
  }
  
  console.log();
  await question("Tekan Enter untuk kembali ke menu...");
  await showMenu();
}

async function testConnection() {
  console.clear();
  log("🔧 Test Connection", "info");
  log("=================", "info");
  console.log();
  
  try {
    const { ethers } = await import('ethers');
    const dotenv = await import('dotenv/config');
    
    log("Testing RPC connection...", "info");
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    log(`✅ RPC Connected - Block: ${blockNumber}`, "success");
    
    log("Testing wallet connection...", "info");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);
    log(`✅ Wallet Connected - Address: ${wallet.address}`, "success");
    log(`✅ Balance: ${ethers.formatEther(balance)} ETH`, "success");
    
    log("Testing Discord token...", "info");
    if (process.env.DISCORD_TOKEN) {
      log("✅ Discord token configured", "success");
    } else {
      log("❌ Discord token not found", "error");
    }
    
  } catch (error) {
    log(`❌ Connection test failed: ${error.message}`, "error");
  }
  
  console.log();
  await question("Tekan Enter untuk kembali ke menu...");
  await showMenu();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
async function main() {
  console.clear();
  log("🤖 R2 Testnet Auto Bot", "info");
  log("======================", "info");
  log("Don't forget to subscribe YT And Telegram @NTExhaust!!", "warning");
  console.log();
  
  if (!await checkEnvironment()) {
    log("❌ Setup environment terlebih dahulu!", "error");
    rl.close();
    process.exit(1);
  }
  
  await showMenu();
}

// Handle process termination
process.on('SIGINT', () => {
  log("\n👋 Bot starter dihentikan", "warning");
  rl.close();
  process.exit(0);
});

main().catch(error => {
  log(`❌ Fatal error: ${error.message}`, "error");
  rl.close();
  process.exit(1);
}); 