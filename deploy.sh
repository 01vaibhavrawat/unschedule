#!/bin/bash
# Local script to easily deploy to an Ubuntu EC2 instance
# Usage: ./deploy.sh <EC2_IP_ADDRESS> <PATH_TO_PEM_KEY>

IP=$1
KEY=$2

if [ -z "$IP" ] || [ -z "$KEY" ]; then
  echo "Usage: ./deploy.sh <EC2_IP_ADDRESS> <PATH_TO_PEM_KEY>"
  echo "Example: ./deploy.sh 13.63.125.147 ./uschedule_key_pair.pem"
  exit 1
fi

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
  echo "Cleaning old Docker build artifacts..."
  sudo docker system prune -f
  echo "Building and starting containers..."
  sudo docker compose up --build -d

  echo ""
  echo "✅ Application containers are up and running!"
EOF

echo ""
echo "=========================================="
echo "🎉 Deployment complete!"
echo "🌍 Access your frontend at: http://$IP"
echo "🔌 Access your backend API at: http://$IP:8000"
echo "=========================================="
