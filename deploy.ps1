param (
    [Parameter(Mandatory=$true, Position=0)]
    [string]$IP,

    [Parameter(Mandatory=$true, Position=1)]
    [string]$KeyPath
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deploying Unschedule to EC2 instance: $IP" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 0. Ensure SSH key permissions are properly set on Windows
if (Test-Path $KeyPath) {
    icacls.exe $KeyPath /inheritance:r | Out-Null
    icacls.exe $KeyPath /grant:r "$($env:USERNAME):(F)" | Out-Null
} else {
    Write-Error "Key file not found at: $KeyPath"
    exit 1
}

# 1. Package and upload code
Write-Host "`nStep 1: Compressing and uploading project files to EC2..." -ForegroundColor Yellow
$archiveName = "app_deploy.tar.gz"

try {
    tar.exe --exclude="node_modules" --exclude=".next" --exclude=".venv" --exclude="__pycache__" --exclude=".git" --exclude=$archiveName -czf $archiveName .
    scp.exe -i $KeyPath -o StrictHostKeyChecking=no $archiveName "ubuntu@${IP}:~/app_deploy.tar.gz"
}
finally {
    if (Test-Path $archiveName) {
        Remove-Item $archiveName -Force
    }
}

# 2. Extract and run Docker Compose on EC2
Write-Host "`nStep 2: Extracting files, setting up Docker, and starting containers..." -ForegroundColor Yellow

$remoteScript = @'
set -e

if ! command -v docker &> /dev/null; then
  echo "Installing Docker and Docker Compose plugin..."
  sudo apt-get update -y
  sudo apt-get install -y docker.io docker-compose-v2
  sudo systemctl enable docker
  sudo systemctl start docker
  sudo usermod -aG docker ubuntu
fi

mkdir -p ~/unschedule
tar -xzf ~/app_deploy.tar.gz -C ~/unschedule
rm -f ~/app_deploy.tar.gz

cd ~/unschedule
echo "Cleaning old Docker build artifacts..."
sudo docker system prune -f
echo "Building and starting Docker containers..."
sudo docker compose up --build -d

echo "Containers are up and running!"
'@

$remoteScript | ssh.exe -i $KeyPath -o StrictHostKeyChecking=no "ubuntu@$IP" "bash -s"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed on remote server with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Frontend: http://$IP" -ForegroundColor Green
Write-Host "Backend API:  http://$IP:8000" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
