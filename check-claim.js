#!/usr/bin/env node

import fs from 'fs';

const CLAIM_FILE = 'last_claim.json';
const CLAIM_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function log(message, type = "info") {
  const colors = {
    info: "\x1b[36m",    // Cyan
    success: "\x1b[32m", // Green
    warning: "\x1b[33m", // Yellow
    error: "\x1b[31m",   // Red
    reset: "\x1b[0m"     // Reset
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function loadLastClaimTime() {
  try {
    if (fs.existsSync(CLAIM_FILE)) {
      const data = JSON.parse(fs.readFileSync(CLAIM_FILE, 'utf8'));
      return data.lastClaimTime;
    }
  } catch (error) {
    log(`Error loading last claim time: ${error.message}`, "warning");
  }
  return 0;
}

function formatTime(ms) {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit ${seconds} detik`;
  } else if (minutes > 0) {
    return `${minutes} menit ${seconds} detik`;
  } else {
    return `${seconds} detik`;
  }
}

function checkClaimStatus() {
  console.log("🔍 R2 Testnet Claim Status Checker");
  console.log("==================================");
  console.log();
  
  const lastClaimTime = loadLastClaimTime();
  const now = Date.now();
  
  if (lastClaimTime === 0) {
    log("✅ Claim tersedia sekarang (belum pernah claim)", "success");
    return;
  }
  
  const lastClaimDate = new Date(lastClaimTime);
  const timeSinceLastClaim = now - lastClaimTime;
  const remainingTime = CLAIM_INTERVAL - timeSinceLastClaim;
  
  console.log(`📅 Last claim: ${lastClaimDate.toLocaleString('id-ID')}`);
  console.log(`⏰ Time since last claim: ${formatTime(timeSinceLastClaim)}`);
  console.log();
  
  if (remainingTime <= 0) {
    log("✅ Claim tersedia sekarang!", "success");
  } else {
    log(`⏳ Claim tersedia dalam: ${formatTime(remainingTime)}`, "warning");
    
    const nextClaimTime = new Date(lastClaimTime + CLAIM_INTERVAL);
    console.log(`📅 Next claim time: ${nextClaimTime.toLocaleString('id-ID')}`);
  }
  
  console.log();
  console.log("💡 Tips:");
  console.log("- Bot akan otomatis claim setiap 24 jam");
  console.log("- Jika claim tidak tersedia, bot akan lanjut dengan swap");
  console.log("- File tracking: last_claim.json");
}

// Run the check
checkClaimStatus(); 