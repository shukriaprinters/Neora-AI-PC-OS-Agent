# NEORA NEURAL OS AGENT - Complete Local & Web Deployment Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Running Locally on Your PC](#running-locally-on-your-pc)
3. [Accessing from Other Devices](#accessing-from-other-devices)
4. [Web Deployment](#web-deployment)
5. [User Guide](#user-guide)
6. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 18.04+)
- **Processor**: Intel i5 or equivalent
- **RAM**: 4GB (8GB recommended)
- **Disk Space**: 2GB
- **Internet**: Required for web deployment

### Required Software
- **Node.js**: v18.0.0 or higher ([nodejs.org](https://nodejs.org))
- **Git**: Version control ([git-scm.com](https://git-scm.com))
- **npm/yarn/pnpm**: Comes with Node.js

---

## Running Locally on Your PC

### Step 1: Clone the Project

```bash
# Clone the repository
git clone https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent.git
cd Neora-AI-PC-OS-Agent

# Switch to the correct branch
git checkout neural-os-agent

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Step 2: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Server Configuration
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# AI Model Keys (Optional but recommended for full features)
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_GOOGLE_API_KEY=your_google_api_key_here

# Database
DATABASE_URL=sqlite:./neora.db
NODE_ENV=development
```

**How to Get API Keys:**
- **Groq**: Visit [console.groq.com](https://console.groq.com) and create an API key
- **Google GenAI**: Visit [makersuite.google.com](https://makersuite.google.com) and create an API key

### Step 3: Start Development Server

```bash
# Run in development mode
npm run dev

# Expected output:
# ✓ Neora OS Agent running on http://localhost:3000
# ✓ WebSocket server ready on ws://localhost:3000
# ✓ Backend services initialized
```

### Step 4: Open in Browser

Open your favorite web browser and navigate to:

```
http://localhost:3000
```

Your local Neora Agent is now fully operational!

---

## Accessing from Other Devices

### Find Your Local IP Address

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" (example: 192.168.1.100)
```

**macOS/Linux:**
```bash
ifconfig | grep inet
# Look for 192.168.x.x
```

### Access from Another Device on Same Network

From any other device on your network, open a browser and go to:

```
http://192.168.1.100:3000
```

Replace 192.168.1.100 with your actual IP address.

### Make Server Accessible Outside Your Network (Optional)

For remote access, use ngrok:

```bash
# Install ngrok
# Download from https://ngrok.com

# Start ngrok tunnel (from another terminal)
ngrok http 3000

# Your public URL will be something like:
# https://xxxx-xxxx-xxxx.ngrok.io
```

---

## Web Deployment

### Option 1: Deploy on Vercel (Recommended - Easiest)

**Prerequisites:**
- Vercel account ([vercel.com](https://vercel.com))
- GitHub account connected to Vercel

**Steps:**

1. Go to Vercel Dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select branch: `neural-os-agent`
5. Add Environment Variables:
   ```
   VITE_GROQ_API_KEY = your_key
   VITE_GOOGLE_API_KEY = your_key
   NODE_ENV = production
   ```
6. Click "Deploy"

**Result:**
- Your app deploys automatically on every push
- URL: `https://neora-[your-project].vercel.app`
- Automatic HTTPS and custom domain support

---

### Option 2: Deploy on AWS EC2

**Step 1: Launch EC2 Instance**

```bash
# From AWS Console:
# 1. Go to EC2 Dashboard
# 2. Click "Launch Instance"
# 3. Select Ubuntu 22.04 LTS
# 4. Choose t3.small or larger instance
# 5. Configure Security Group:
#    - Allow inbound on ports 80, 443, 3000
```

**Step 2: Connect to Your Server**

```bash
# Download PEM file and connect
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

**Step 3: Install Required Software**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt-get install -y git

# Install Nginx (for reverse proxy)
sudo apt-get install -y nginx

# Install SSL tools
sudo apt-get install -y certbot python3-certbot-nginx
```

**Step 4: Deploy Application**

```bash
# Clone and setup project
git clone https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent.git
cd Neora-AI-PC-OS-Agent
git checkout neural-os-agent

# Install dependencies
npm install

# Build for production
npm run build

# Create environment file
cat > .env << 'EOF'
VITE_GROQ_API_KEY=your_key
VITE_GOOGLE_API_KEY=your_key
DATABASE_URL=sqlite:./neora.db
NODE_ENV=production
PORT=3000
EOF

# Install PM2 (process manager)
sudo npm install -g pm2

# Start the application
pm2 start "npm start" --name "neora"
pm2 startup
pm2 save
```

**Step 5: Configure Nginx**

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/neora
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /ws {
        proxy_pass http://localhost:3000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable and restart
sudo ln -s /etc/nginx/sites-available/neora /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d your-domain.com

# Verify SSL auto-renewal
sudo certbot renew --dry-run
```

**Result:**
- Your app runs on a custom domain
- Automatic HTTPS with free SSL certificate
- Automatic certificate renewal

---

### Option 3: Deploy on DigitalOcean

**Step 1: Create App Spec**

Create `app.yaml` in your project root:

```yaml
name: neora-agent
services:
- name: web
  github:
    branch: neural-os-agent
    repo: shukriaprinters/Neora-AI-PC-OS-Agent
  build_command: npm install && npm run build
  run_command: npm start
  http_port: 3000
  envs:
  - key: VITE_GROQ_API_KEY
    scope: RUN_AND_BUILD_TIME
    value: ${GROQ_API_KEY}
  - key: VITE_GOOGLE_API_KEY
    scope: RUN_AND_BUILD_TIME
    value: ${GOOGLE_API_KEY}
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "3000"
databases:
- name: neora-db
  engine: SQLITE
domains:
- domain: your-domain.com
  type: PRIMARY
```

**Step 2: Deploy**

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect GitHub and authorize
4. Select your repository
5. Choose the `neural-os-agent` branch
6. Upload the `app.yaml` file
7. Add environment variables
8. Click "Create Resources" and "Deploy"

**Result:**
- Auto-deployed app
- Free SSL certificate included
- Automatic redeploys on git push

---

### Option 4: Deploy on Heroku

```bash
# Install Heroku CLI
# From https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create app
heroku create neora-agent

# Add buildpack
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set VITE_GROQ_API_KEY=your_key
heroku config:set VITE_GOOGLE_API_KEY=your_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku neural-os-agent:main

# View logs
heroku logs --tail
```

---

## User Guide

### Dashboard Features

**Real-time System Monitoring:**
1. Open the Dashboard tab (default)
2. View real-time metrics:
   - CPU Usage with status indicator
   - Memory Usage with progress bar
   - Disk Usage statistics
   - Network bandwidth
3. Charts update every 5 seconds automatically

### Voice Command Interface

**Give Voice Commands:**
1. Click on "Voice Command" tab
2. Click the microphone icon to start listening
3. Speak your command in English
4. Or type directly in the text field
5. Click Send or press Enter

**Example Commands:**
```
"show system status"
"list running processes"
"get disk usage"
"show network info"
"execute command ls -la"
"what is my cpu usage"
```

### Workflow Builder

**Create Automation Workflows:**
1. Open "Workflows" tab
2. Click "Create New Workflow"
3. Enter workflow name and description
4. Add steps:
   - Click "Add Step"
   - Select action type (Command, Wait, Condition)
   - Configure the step
   - Add conditions (optional)
5. Set schedule:
   - None, Hourly, Daily, Weekly, etc.
6. Save and Enable

**Example Workflow:**
- **Step 1**: Execute "npm run build"
- **Step 2**: Wait 5 seconds
- **Step 3**: Execute "npm start"

### Terminal Interface

**Run Direct Commands:**
1. Open "Terminal" tab
2. Type commands directly
3. Press Enter to execute
4. View results immediately
5. Scroll to see command history

**Built-in Commands:**
```
help              - Show all available commands
system            - Display system information
processes         - List running processes
memory            - Show memory usage
disk              - Show disk usage
network           - Show network information
cpu               - Show CPU information
status            - Show overall system status
clear             - Clear terminal screen
history           - Show command history
```

**Execute System Commands:**
```
execute ps aux
execute ls -la /home
execute df -h
execute netstat -an
```

### Process Explorer

**Monitor Running Processes:**
1. Open "Process Explorer" tab
2. View all running processes
3. See CPU and Memory usage per process
4. Click "Kill" to terminate a process
5. Search for specific process
6. Sort by CPU or Memory usage

---

## Production Checklist

Before deploying to production:

- [ ] Set all required environment variables
- [ ] Configure HTTPS/SSL certificate
- [ ] Set up firewall rules
- [ ] Configure database backups
- [ ] Set up monitoring and alerts
- [ ] Configure log collection
- [ ] Test all features on staging
- [ ] Set up error tracking (optional: Sentry)
- [ ] Configure rate limiting
- [ ] Set up DNS records
- [ ] Test auto-scaling (if applicable)

---

## Troubleshooting

### Error: Cannot find module

**Solution:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 already in use

**Solution:**

Windows:
```bash
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

macOS/Linux:
```bash
lsof -i :3000
kill -9 [PID]
```

### WebSocket connection failed

**Troubleshooting:**
1. Check firewall settings
2. Verify port 3000 is open
3. Check proxy settings
4. Restart server: `npm run dev`
5. Clear browser cache (Ctrl+Shift+Delete)

### Application won't start

**Debug:**
```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version

# Run with debug output
DEBUG=* npm run dev

# Check logs
npm run dev 2>&1 | tee debug.log
```

### API calls failing

**Solutions:**
1. Verify API keys in `.env` file
2. Check API key is valid and has quota
3. Restart server
4. Check browser console (F12)
5. Check server logs

### Database errors

**Solutions:**
```bash
# Reset database
rm neora.db

# Restart server
npm run dev

# Check database permissions
ls -la neora.db
```

---

## Security Best Practices

### Local Setup
- Keep `.env` file secure
- Never share API keys
- Use strong passwords
- Keep software updated
- Use firewall

### Web Deployment
- Always use HTTPS
- Implement authentication
- Set strong passwords
- Regular backups
- Monitor logs
- Update dependencies regularly
- Use rate limiting
- Enable CORS properly

### API Security
- Validate all inputs
- Use environment variables for secrets
- Implement rate limiting
- Add authentication layer
- Log all API calls
- Monitor for unusual activity

---

## Performance Optimization

### Local Optimization
```bash
# Build for production locally
npm run build

# Run production build
npm start

# Monitor performance
npm run dev -- --profile
```

### Web Optimization
- Enable compression
- Use CDN for static assets
- Implement caching
- Optimize images
- Minify code
- Use lazy loading

---

## Additional Resources

- **GitHub**: https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent
- **Documentation**: README_PREMIUM.md
- **API Reference**: BROWSER_DEPLOYMENT_GUIDE.md
- **Issues & Support**: GitHub Issues

---

## FAQ

**Q: Can I run Neora without internet?**
A: Yes, when running locally without API keys, all features work offline.

**Q: Where is data stored?**
A: Locally: `neora.db` file. On web: Your hosting provider's database.

**Q: Can multiple users connect?**
A: Yes, server supports multiple simultaneous WebSocket connections.

**Q: Is my data secure?**
A: Yes, data stays on your machine when running locally (unless using APIs).

**Q: What browsers are supported?**
A: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

**Q: Can I customize the UI?**
A: Yes, modify React components in `src/components/` folder.

---

**Last Updated**: June 2024
**Version**: 2.0.0
**Maintained By**: Neora Development Team
