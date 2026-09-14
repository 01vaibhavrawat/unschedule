#!/bin/bash
# Local script to easily deploy to an Ubuntu EC2 instance
# Usage: ./deploy.sh <EC2_IP_ADDRESS> <PATH_TO_PEM_KEY>

IP=$1
KEY=$2

if [ -z "$IP" ] || [ -z "$KEY" ]; then
  echo "Usage: ./deploy.sh <EC2_IP_ADDRESS> <PATH_TO_PEM_KEY>"
  echo "Example: ./deploy.sh 3.15.22.100 ~/.ssh/my-key.pem"
  exit 1
fi

echo "=========================================="
echo "🚀 Deploying Unschedule to EC2 instance: $IP"
echo "=========================================="

# 1. Copy project files to EC2
echo ""
echo "📦 Step 1: Copying project files to EC2..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.venv' --exclude '__pycache__' --exclude '.git' -e "ssh -i $KEY -o StrictHostKeyChecking=no" . ubuntu@$IP:~/unschedule

# 2. Run setup and docker-compose on EC2
echo ""
echo "🐳 Step 2: Setting up Docker and starting the app on EC2..."
ssh -i $KEY -o StrictHostKeyChecking=no ubuntu@$IP << 'EOF'
  # Install Docker & Docker Compose if not present
  if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker and Docker Compose..."
    sudo apt-get update -y
    sudo apt-get install -y docker.io docker-compose
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker ubuntu
  else
    echo "Docker is already installed."
  fi

  # Navigate to the app directory
  cd ~/unschedule

  # Start the application using Docker Compose
  echo "Building and starting containers..."
  # Using sudo because the group change requires a re-login to take effect without it
  sudo docker-compose up --build -d

  echo ""
  echo "✅ Application containers are up and running!"
EOF

echo ""
echo "=========================================="
echo "🎉 Deployment complete!"
echo "🌍 Access your frontend at: http://$IP"
echo "🔌 Access your backend API at: http://$IP:8000"
echo "=========================================="
