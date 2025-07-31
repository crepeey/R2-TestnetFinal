import "dotenv/config";
import { ethers } from "ethers";
import axios from "axios";
import FormData from "form-data";
import { v4 as uuid } from "uuid";
import fs from "fs";

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const APP_ID = "1356609826230243469";
const GUILD_ID = "1308368864505106442";
const COMMAND_ID = "1356665931056808211";
const COMMAND_VERSION = "1356665931056808212";
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Network configurations
const SEPOLIA_CONFIG = {
  RPC_URL: process.env.RPC_URL,
  USDC_ADDRESS: process.env.USDC_ADDRESS,
  R2USD_ADDRESS: process.env.R2USD_ADDRESS,
  sR2USD_ADDRESS: process.env.sR2USD_ADDRESS,
  ROUTER_USDC_TO_R2USD: "0x9e8FF356D35a2Da385C546d6Bf1D77ff85133365",
  ROUTER_R2USD_TO_USDC: "0x47d1B0623bB3E557bF8544C159c9ae51D091F8a2",
  STAKING_CONTRACT: "0x006CbF409CA275bA022111dB32BDAE054a97d488",
  LP_R2USD_sR2USD: "0xe85A06C238439F981c90b2C91393b2F3c46e27FC",
  LP_USDC_R2USD: "0x47d1B0623bB3E557bF8544C159c9ae51D091F8a2",
  NETWORK_NAME: "Sepolia Testnet"
};

const SEPOLIA_R2_CONFIG = {
  RPC_URL: process.env.RPC_URL,
  R2_ADDRESS: process.env.R2_ADDRESS,
  USDC_ADDRESS: process.env.R2_USDC_ADDRESS,
  R2USD_ADDRESS: process.env.R2_R2USD_ADDRESS,
  ROUTER_ADDRESS: "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3",
  LP_R2_R2USD: "0x9Ae18109692b43e95Ae6BE5350A5Acc5211FE9a1", 
  LP_USDC_R2: "0xCdfDD7dD24bABDD05A2ff4dfcf06384c5Ad661a9", 
  NETWORK_NAME: "Sepolia R2 Testnet"
};

// ABIs
const ERC20ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)"
];

const ROUTER_ABI = [
  {
    "inputs": [
      {"internalType":"uint256","name":"amountIn","type":"uint256"},
      {"internalType":"uint256","name":"amountOutMin","type":"uint256"},
      {"internalType":"address[]","name":"path","type":"address[]"},
      {"internalType":"address","name":"to","type":"address"},
      {"internalType":"uint256","name":"deadline","type":"uint256"}
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Global variables
let wallet;
let provider;
let currentNonce = 0;
let swapDirection = {
  "Sepolia": true,
  "Sepolia R2": true
};

// Claim tracking
const CLAIM_FILE = 'last_claim.json';
const CLAIM_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Human-like swap ranges (percentage of balance)
const HUMAN_SWAP_RANGES = {
  SMALL: { min: 0.1, max: 0.3 },    // 10-30% of balance
  MEDIUM: { min: 0.3, max: 0.6 },   // 30-60% of balance
  LARGE: { min: 0.6, max: 0.9 }     // 60-90% of balance
};

// Utility functions
function log(message, type = "info") {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: "\x1b[36m",    // Cyan
    success: "\x1b[32m", // Green
    warning: "\x1b[33m", // Yellow
    error: "\x1b[31m",   // Red
    reset: "\x1b[0m"     // Reset
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomDelay(min = 2000, max = 5000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getHumanLikeSwapAmount(balance) {
  // Randomly choose swap size based on human behavior
  const swapSizes = Object.values(HUMAN_SWAP_RANGES);
  const weights = [0.4, 0.4, 0.2]; // 40% small, 40% medium, 20% large
  
  let random = Math.random();
  let selectedRange;
  
  if (random < weights[0]) {
    selectedRange = swapSizes[0]; // SMALL
  } else if (random < weights[0] + weights[1]) {
    selectedRange = swapSizes[1]; // MEDIUM
  } else {
    selectedRange = swapSizes[2]; // LARGE
  }
  
  const percentage = getRandomNumber(selectedRange.min, selectedRange.max);
  const amount = balance * percentage;
  
  // Add some randomness to make it more human-like
  const variation = getRandomNumber(0.95, 1.05); // ±5% variation
  return amount * variation;
}

function getHumanLikeDelay() {
  // Human-like delays: sometimes quick, sometimes slow
  const delays = [
    { min: 5000, max: 15000, weight: 0.3 },   // Quick (5-15s)
    { min: 15000, max: 45000, weight: 0.4 },  // Normal (15-45s)
    { min: 45000, max: 120000, weight: 0.2 }, // Slow (45s-2min)
    { min: 120000, max: 300000, weight: 0.1 } // Very slow (2-5min)
  ];
  
  let random = Math.random();
  let selectedDelay;
  
  for (const delay of delays) {
    if (random < delay.weight) {
      selectedDelay = delay;
      break;
    }
    random -= delay.weight;
  }
  
  return getRandomNumber(selectedDelay.min, selectedDelay.max);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Claim tracking functions
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

function saveLastClaimTime() {
  try {
    const data = { lastClaimTime: Date.now() };
    fs.writeFileSync(CLAIM_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    log(`Error saving last claim time: ${error.message}`, "warning");
  }
}

function canClaim() {
  const lastClaimTime = loadLastClaimTime();
  const now = Date.now();
  const timeSinceLastClaim = now - lastClaimTime;
  
  if (timeSinceLastClaim >= CLAIM_INTERVAL) {
    return true;
  }
  
  const remainingTime = CLAIM_INTERVAL - timeSinceLastClaim;
  const hours = Math.floor(remainingTime / (60 * 60 * 1000));
  const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
  
  log(`⏰ Claim tersedia dalam ${hours} jam ${minutes} menit`, "warning");
  return false;
}

// Initialize wallet and provider
async function initializeWallet() {
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    currentNonce = await provider.getTransactionCount(wallet.address);
    log(`Wallet initialized: ${wallet.address}`, "success");
    return true;
  } catch (error) {
    log(`Failed to initialize wallet: ${error.message}`, "error");
    return false;
  }
}

// Get token balance
async function getTokenBalance(tokenAddress) {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
    const balance = await contract.balanceOf(wallet.address);
    const decimals = await contract.decimals();
    return parseFloat(ethers.formatUnits(balance, decimals));
  } catch (error) {
    log(`Failed to get token balance: ${error.message}`, "error");
    return 0;
  }
}

// Ensure token approval
async function ensureApproval(tokenAddress, spender, amount) {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20ABI, wallet);
    const allowance = await contract.allowance(wallet.address, spender);
    
    if (allowance < amount) {
      log(`Approving ${ethers.formatUnits(amount, 6)} tokens...`, "info");
      const tx = await contract.approve(spender, amount, { nonce: currentNonce++ });
      await tx.wait();
      log("Approval successful", "success");
    }
    return true;
  } catch (error) {
    log(`Approval failed: ${error.message}`, "error");
    return false;
  }
}

// Claim faucet function
async function claimFaucet() {
  try {
    if (!DISCORD_TOKEN) {
      throw new Error("DISCORD_TOKEN tidak ditemukan di .env");
    }

    // Check if we can claim
    if (!canClaim()) {
      return false;
    }

    const channelId = "1339883019556749395"; // Sepolia channel
    const payload = {
      type: 2,
      application_id: APP_ID,
      guild_id: GUILD_ID,
      channel_id: channelId,
      session_id: uuid(),
      data: {
        version: COMMAND_VERSION,
        id: COMMAND_ID,
        name: "faucet",
        type: 1,
        options: [{ type: 3, name: "address", value: wallet.address }]
      },
      nonce: Date.now().toString()
    };

    const form = new FormData();
    form.append("payload_json", JSON.stringify(payload));

    log("🎯 Claiming faucet...", "info");
    await axios.post("https://discord.com/api/v9/interactions", form, {
      headers: { Authorization: DISCORD_TOKEN, ...form.getHeaders() }
    });

    // Save claim time
    saveLastClaimTime();
    
    // Wait for claim to process
    await delay(5000);
    log("✅ Faucet claim request sent successfully", "success");
    return true;
  } catch (error) {
    log(`❌ Faucet claim failed: ${error.message}`, "error");
    return false;
  }
}

// Swap functions with human-like amount calculation
async function swapUsdcToR2usd() {
  try {
    const usdcBalance = await getTokenBalance(SEPOLIA_CONFIG.USDC_ADDRESS);
    
    if (usdcBalance < 1) {
      log("⚠️ USDC balance too low for swap", "warning");
      return false;
    }

    // Get human-like swap amount
    const amount = getHumanLikeSwapAmount(usdcBalance);
    
    log(`🔄 Swapping ${amount.toFixed(2)} USDC to R2USD (${((amount/usdcBalance)*100).toFixed(1)}% of balance)`, "info");
    
    const amountIn = ethers.parseUnits(amount.toString(), 6);
    const router = new ethers.Contract(SEPOLIA_CONFIG.ROUTER_USDC_TO_R2USD, ROUTER_ABI, wallet);
    
    await ensureApproval(SEPOLIA_CONFIG.USDC_ADDRESS, SEPOLIA_CONFIG.ROUTER_USDC_TO_R2USD, amountIn);
    
    const path = [SEPOLIA_CONFIG.USDC_ADDRESS, SEPOLIA_CONFIG.R2USD_ADDRESS];
    const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
    
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      0, // amountOutMin - set to 0 for testnet
      path,
      wallet.address,
      deadline,
      { nonce: currentNonce++ }
    );
    
    await tx.wait();
    log("✅ USDC to R2USD swap successful", "success");
    return true;
  } catch (error) {
    log(`❌ USDC to R2USD swap failed: ${error.message}`, "error");
    return false;
  }
}

async function swapR2usdToUsdc() {
  try {
    const r2usdBalance = await getTokenBalance(SEPOLIA_CONFIG.R2USD_ADDRESS);
    
    if (r2usdBalance < 1) {
      log("⚠️ R2USD balance too low for swap", "warning");
      return false;
    }

    // Get human-like swap amount
    const amount = getHumanLikeSwapAmount(r2usdBalance);
    
    log(`🔄 Swapping ${amount.toFixed(2)} R2USD to USDC (${((amount/r2usdBalance)*100).toFixed(1)}% of balance)`, "info");
    
    const amountIn = ethers.parseUnits(amount.toString(), 6);
    const router = new ethers.Contract(SEPOLIA_CONFIG.ROUTER_R2USD_TO_USDC, ROUTER_ABI, wallet);
    
    await ensureApproval(SEPOLIA_CONFIG.R2USD_ADDRESS, SEPOLIA_CONFIG.ROUTER_R2USD_TO_USDC, amountIn);
    
    const path = [SEPOLIA_CONFIG.R2USD_ADDRESS, SEPOLIA_CONFIG.USDC_ADDRESS];
    const deadline = Math.floor(Date.now() / 1000) + 300;
    
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      0,
      path,
      wallet.address,
      deadline,
      { nonce: currentNonce++ }
    );
    
    await tx.wait();
    log("✅ R2USD to USDC swap successful", "success");
    return true;
  } catch (error) {
    log(`❌ R2USD to USDC swap failed: ${error.message}`, "error");
    return false;
  }
}

// Auto swap function with human-like behavior
async function autoSwap() {
  try {
    const usdcBalance = await getTokenBalance(SEPOLIA_CONFIG.USDC_ADDRESS);
    const r2usdBalance = await getTokenBalance(SEPOLIA_CONFIG.R2USD_ADDRESS);
    
    log(`💰 Current balances - USDC: ${usdcBalance.toFixed(2)}, R2USD: ${r2usdBalance.toFixed(2)}`, "info");
    
    // Sometimes skip swap (human behavior)
    if (Math.random() < 0.1) { // 10% chance to skip
      log("🤔 Skipping swap this time (human behavior)", "warning");
      return false;
    }
    
    let success = false;
    
    if (swapDirection["Sepolia"]) {
      if (usdcBalance > 1) {
        success = await swapUsdcToR2usd();
      } else if (r2usdBalance > 1) {
        success = await swapR2usdToUsdc();
      }
    } else {
      if (r2usdBalance > 1) {
        success = await swapR2usdToUsdc();
      } else if (usdcBalance > 1) {
        success = await swapUsdcToR2usd();
      }
    }
    
    if (success) {
      swapDirection["Sepolia"] = !swapDirection["Sepolia"];
    }
    
    return success;
  } catch (error) {
    log(`❌ Auto swap failed: ${error.message}`, "error");
    return false;
  }
}

// Main automation function
async function runAutomation() {
  log("🚀 Starting R2 Testnet Auto Bot", "info");
  log("🤖 Human-like behavior enabled", "info");
  log("⏰ 24-hour claim interval enabled", "info");
  log("Don't forget to subscribe YT And Telegram @NTExhaust!!", "warning");
  
  if (!await initializeWallet()) {
    return;
  }
  
  let cycle = 1;
  
  while (true) {
    try {
      log(`\n🔄 === Cycle ${cycle} ===`, "info");
      
      // Step 1: Check and claim faucet (24-hour interval)
      log("📋 Step 1: Checking faucet availability...", "info");
      const claimed = await claimFaucet();
      
      if (claimed) {
        log("⏳ Waiting for tokens to arrive...", "info");
        await delay(getRandomDelay(10000, 15000));
      } else {
        log("⏰ Claim not available yet, continuing with swap...", "warning");
      }
      
      // Step 2: Human-like delay before swap
      const swapDelay = getHumanLikeDelay();
      log(`⏳ Step 2: Waiting ${Math.floor(swapDelay/1000)} seconds before swap (human behavior)...`, "info");
      await delay(swapDelay);
      
      // Step 3: Auto swap with human-like amounts
      log("🔄 Step 3: Performing human-like swap...", "info");
      await autoSwap();
      
      // Step 4: Human-like delay before next cycle
      const cycleDelay = getHumanLikeDelay();
      log(`⏳ Step 4: Waiting ${Math.floor(cycleDelay/1000)} seconds before next cycle...`, "info");
      await delay(cycleDelay);
      
      cycle++;
      
    } catch (error) {
      log(`❌ Cycle ${cycle} failed: ${error.message}`, "error");
      await delay(10000); // Wait 10 seconds before retrying
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log("\n🛑 Bot stopped by user", "warning");
  process.exit(0);
});

process.on('SIGTERM', () => {
  log("\n🛑 Bot terminated", "warning");
  process.exit(0);
});

// ESM-safe main check
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  runAutomation().catch(error => {
    log(`❌ Fatal error: ${error.message}`, "error");
    process.exit(1);
  });
} 