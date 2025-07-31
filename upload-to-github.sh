#!/bin/bash

# R2 Testnet Bot - GitHub Upload Helper
# Don't forget to subscribe YT And Telegram @NTExhaust!!

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "🚀 R2 Testnet Bot - GitHub Upload Helper"
echo "========================================"
echo ""

print_status "Checking current git status..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "❌ Git repository not initialized!"
    print_status "Initializing git repository..."
    git init
fi

# Check current status
git_status=$(git status --porcelain)
if [ -z "$git_status" ]; then
    print_success "✅ All changes are committed"
else
    print_warning "⚠️  There are uncommitted changes"
    echo ""
    echo "Current changes:"
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n): " commit_changes
    
    if [[ $commit_changes == "y" || $commit_changes == "Y" ]]; then
        print_status "Committing changes..."
        git add .
        git commit -m "feat: Add automated R2 testnet bot with human-like behavior"
        print_success "✅ Changes committed"
    fi
fi

echo ""
echo "📋 Choose upload method:"
echo "1. 🔑 Use Personal Access Token (Recommended)"
echo "2. 🔐 Use SSH Key"
echo "3. 🌐 Create new repository"
echo "4. ❌ Cancel"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        print_status "🔑 Personal Access Token Method"
        echo "=================================="
        echo ""
        echo "📝 Steps to create Personal Access Token:"
        echo "1. Go to GitHub.com and login"
        echo "2. Click your profile picture → Settings"
        echo "3. Scroll down → Developer settings"
        echo "4. Personal access tokens → Tokens (classic)"
        echo "5. Generate new token → Generate new token (classic)"
        echo "6. Note: 'R2 Bot Upload'"
        echo "7. Expiration: 90 days (or custom)"
        echo "8. Select scopes: ✓ repo (all repo permissions)"
        echo "9. Click 'Generate token'"
        echo "10. Copy the token (you won't see it again!)"
        echo ""
        read -p "Have you created the token? (y/n): " token_ready
        
        if [[ $token_ready == "y" || $token_ready == "Y" ]]; then
            echo ""
            print_warning "⚠️  Enter your GitHub username and token below:"
            echo "Format: https://USERNAME:TOKEN@github.com/USERNAME/REPO.git"
            echo ""
            read -p "GitHub Username: " github_username
            read -s -p "Personal Access Token: " github_token
            echo ""
            
            # Set new remote URL
            new_url="https://${github_username}:${github_token}@github.com/${github_username}/R2FinalTestnet-NTE.git"
            git remote set-url origin "$new_url"
            
            print_status "Pushing to GitHub..."
            if git push origin main; then
                print_success "✅ Successfully uploaded to GitHub!"
                echo ""
                echo "🌐 Your repository: https://github.com/${github_username}/R2FinalTestnet-NTE"
            else
                print_error "❌ Failed to push to GitHub"
                echo "Please check your token and try again"
            fi
        fi
        ;;
        
    2)
        echo ""
        print_status "🔐 SSH Key Method"
        echo "=================="
        echo ""
        echo "📝 Steps to setup SSH key:"
        echo "1. Generate SSH key: ssh-keygen -t ed25519 -C 'your_email@example.com'"
        echo "2. Add SSH key to ssh-agent: ssh-add ~/.ssh/id_ed25519"
        echo "3. Copy public key: cat ~/.ssh/id_ed25519.pub"
        echo "4. Add to GitHub: Settings → SSH and GPG keys → New SSH key"
        echo "5. Paste the public key and save"
        echo ""
        read -p "Have you setup SSH key? (y/n): " ssh_ready
        
        if [[ $ssh_ready == "y" || $ssh_ready == "Y" ]]; then
            read -p "GitHub Username: " github_username
            git remote set-url origin "git@github.com:${github_username}/R2FinalTestnet-NTE.git"
            
            print_status "Pushing to GitHub..."
            if git push origin main; then
                print_success "✅ Successfully uploaded to GitHub!"
                echo ""
                echo "🌐 Your repository: https://github.com/${github_username}/R2FinalTestnet-NTE"
            else
                print_error "❌ Failed to push to GitHub"
                echo "Please check your SSH key and try again"
            fi
        fi
        ;;
        
    3)
        echo ""
        print_status "🌐 Create New Repository"
        echo "============================"
        echo ""
        echo "📝 Steps to create new repository:"
        echo "1. Go to GitHub.com and login"
        echo "2. Click '+' → New repository"
        echo "3. Repository name: R2FinalTestnet-NTE"
        echo "4. Description: R2 Testnet Auto Bot with Human-like Behavior"
        echo "5. Make it Public or Private (your choice)"
        echo "6. Don't initialize with README (we already have one)"
        echo "7. Click 'Create repository'"
        echo "8. Copy the repository URL"
        echo ""
        read -p "Have you created the repository? (y/n): " repo_ready
        
        if [[ $repo_ready == "y" || $repo_ready == "Y" ]]; then
            read -p "Enter repository URL: " repo_url
            git remote set-url origin "$repo_url"
            
            print_status "Pushing to GitHub..."
            if git push -u origin main; then
                print_success "✅ Successfully uploaded to GitHub!"
                echo ""
                echo "🌐 Your repository: $repo_url"
            else
                print_error "❌ Failed to push to GitHub"
                echo "Please check the URL and try again"
            fi
        fi
        ;;
        
    4)
        print_warning "❌ Upload cancelled"
        exit 0
        ;;
        
    *)
        print_error "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
print_success "🎉 Upload process completed!"
echo ""
echo "📚 Next steps:"
echo "1. Update your .env file with your configuration"
echo "2. Run: npm install"
echo "3. Run: ./run.sh"
echo "4. Enjoy your automated R2 testnet bot!"
echo ""
echo "💡 Don't forget to subscribe YT And Telegram @NTExhaust!!" 