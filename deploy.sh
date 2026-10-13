#!/bin/bash
# Local script to easily deploy to an Ubuntu EC2 instance
# Usage: ./deploy.sh <EC2_IP_ADDRESS> <PATH_TO_PEM_KEY>

IP=${1:-"16.192.66.228"}
KEY=${2:-"./uschedule_key_pair.pem"}

# Detect whether we should use native Windows ssh.exe (if in Git Bash/MSYS) to avoid permission issues
SSH_CMD="ssh"
SCP_CMD="scp"
if command -v ssh.exe &> /dev/null; then
  SSH_CMD="ssh.exe"
  SCP_CMD="scp.exe"
fi

echo "=========================================="
echo "🚀 Deploying Unschedule to EC2 instance: $IP"
echo "=========================================="

# 1. Package and upload code
echo ""
echo "📦 Step 1: Compressing and uploading project files to EC2..."
ARCHIVE="app_deploy.tar.gz"
tar --exclude='node_modules' --exclude='.next' --exclude='.venv' --exclude='__pycache__' --exclude='.git' --exclude='docker-compose.override.yml' --exclude="$ARCHIVE" -czf "$ARCHIVE" .
$SCP_CMD -i "$KEY" -o StrictHostKeyChecking=no "$ARCHIVE" ubuntu@$IP:~/app_deploy.tar.gz
rm -f "$ARCHIVE"

# 2. Extract and run Docker Compose on EC2
echo ""
echo "🐳 Step 2: Extracting files, setting up Docker, and starting containers..."
$SSH_CMD -i "$KEY" -o StrictHostKeyChecking=no ubuntu@$IP bash << EOF
  set -e

  # Install Docker & Docker Compose if not present
  if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker and Docker Compose..."
    sudo apt-get update -y
    sudo apt-get install -y docker.io docker-compose-v2
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker ubuntu
  else
    echo "Docker is already installed."
  fi

  # Extract code
  mkdir -p ~/unschedule
  tar -xzf ~/app_deploy.tar.gz -C ~/unschedule
  rm -f ~/app_deploy.tar.gz

  # Navigate to the app directory
  cd ~/unschedule

  # Start the application using Docker Compose
  echo "Stopping previous containers..."
  sudo docker compose down --remove-orphans || true
  echo "Cleaning old Docker build artifacts..."
  sudo docker system prune -f
  echo "Building and starting containers with SSL..."
  sudo docker compose up --build -d

  echo ""
  echo "✅ Application containers are up and running!"
EOF

echo ""
echo "=========================================="
echo "🎉 Deployment complete!"
echo "🌍 Website:     https://moola.guide"
echo "🌐 Alternative: https://www.moola.guide"
echo "🔌 API Docs:    https://moola.guide/docs"
echo "=========================================="
