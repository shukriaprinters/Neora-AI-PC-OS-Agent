# Neora Neural OS Agent - Web Browser Deployment Guide

## Overview

This comprehensive guide explains how to deploy and run the Neora Neural OS Agent in a web browser. The application is a premium-grade AI operating system agent with real-time monitoring, command execution, workflow automation, and an advanced holographic UI.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [Accessing via Web Browser](#accessing-via-web-browser)
5. [Architecture Overview](#architecture-overview)
6. [Feature Documentation](#feature-documentation)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

---

## System Requirements

### Minimum Requirements
- **OS:** Linux, macOS, or Windows (WSL2)
- **Node.js:** v18.0.0 or higher
- **npm:** v8.0.0 or higher
- **RAM:** 4GB minimum (8GB recommended)
- **Disk Space:** 2GB for installation and dependencies
- **Browser:** Chrome/Edge 90+, Firefox 88+, Safari 14+

### Recommended Requirements
- **Node.js:** v20.0.0 or higher
- **RAM:** 16GB or more
- **CPU:** Multi-core processor (4+ cores)
- **Network:** Stable internet connection (1 Mbps+ for optimal performance)

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent.git
cd Neora-AI-PC-OS-Agent
git checkout neural-os-agent
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install
```

### Step 3: Environment Setup

Create a `.env` file in the project root:

```bash
# .env
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Optional: AI Gateway Configuration
AI_GATEWAY_API_KEY=your_api_key_here

# Optional: Google GenAI Configuration
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Groq Configuration
GROQ_API_KEY=your_groq_api_key_here
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on:
- **Frontend:** http://localhost:3000 or http://localhost:5173
- **Backend API:** http://localhost:3000
- **WebSocket:** ws://localhost:3000/ws

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment (Optional)

```bash
# Build Docker image
docker build -t neora-neural-os .

# Run container
docker run -p 3000:3000 neora-neural-os
```

---

## Accessing via Web Browser

### Local Development

1. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

2. **Verify the connection:**
   - You should see the Neora OS logo and "Neural Agent v2.0" header
   - The status indicator should show "Standby" initially
   - Once WebSocket connects, it will change to "Online"

3. **Navigation:**
   - Click the menu icon (☰) on the top-left to open/close sidebar
   - Use sidebar navigation to access different modules
   - Click notification bell for system alerts

### Remote Access (Development)

To access from another machine on your network:

```bash
# Find your machine's IP address
# Linux/macOS
hostname -I

# Windows
ipconfig

# Then access from remote machine
http://YOUR_IP_ADDRESS:3000
```

### HTTPS Setup (Recommended for Production)

1. **Using Let's Encrypt (Recommended):**

```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d your-domain.com
```

2. **Update server configuration:**

```typescript
// In your server.ts or index.ts
import https from 'https';
import fs from 'fs';

const httpsOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/your-domain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/your-domain.com/fullchain.pem'),
};

https.createServer(httpsOptions, app).listen(443);
```

3. **Access via HTTPS:**
```
https://your-domain.com
```

---

## Architecture Overview

### Frontend Architecture

```
src/
├── components/
│   ├── PremiumShell.tsx           # Main layout shell
│   ├── PremiumSidebar.tsx          # Navigation sidebar
│   ├── DashboardCards.tsx          # System metrics & charts
│   ├── PremiumVoiceCommand.tsx     # Voice interface
│   ├── AdvancedWorkflowBuilder.tsx # Workflow management
│   ├── TerminalInterface.tsx       # Command terminal
│   ├── ProcessExplorer.tsx         # Process manager
│   └── PremiumNeuralOSApp.tsx      # Main app component
├── App.tsx
├── main.tsx
└── index.css
```

### Backend Architecture

```
src/server/
├── index.ts                    # Main server file
├── services/
│   ├── osManager.ts           # OS integration
│   ├── websocketManager.ts    # WebSocket handling
│   ├── workflowEngine.ts      # Workflow execution
│   ├── aiAgent.ts             # AI agent logic
│   ├── databaseManager.ts     # Data persistence
│   └── securityManager.ts     # Security & access control
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Framer Motion |
| **UI Components** | Lucide Icons, Recharts, Tailwind CSS |
| **State Management** | React Hooks, Context API |
| **Backend** | Express.js, Node.js, TypeScript |
| **Real-time** | WebSocket (ws library) |
| **Database** | SQLite, Better-SQLite3 |
| **AI/ML** | Google GenAI, Groq, Vercel AI Gateway |
| **Build Tool** | Vite |
| **Package Manager** | npm/yarn/pnpm |

---

## Feature Documentation

### 1. System Dashboard

**Location:** Main dashboard (default view)

**Features:**
- Real-time CPU, Memory, Disk, and Network metrics
- Live CPU trend chart (last 5 minutes)
- Resource distribution bar chart
- System information cards
- Auto-refreshing metrics every 3 seconds

**Usage:**
```
Monitor system performance in real-time
No user input required - just view and monitor
```

### 2. Voice Command Interface

**Location:** Sidebar → Voice Command

**Features:**
- Web Speech API integration
- Microphone input with waveform visualization
- Command history with status tracking
- Quick command templates
- Real-time feedback

**Usage:**
```
1. Click "Start Listening" button
2. Speak your command
3. Press "Execute" or wait for auto-execution
4. View results in history panel
```

**Example Commands:**
```
- "List running processes"
- "Check system status"
- "Start backup process"
- "Clear cache memory"
- "Run system diagnostic"
```

### 3. Workflow Manager

**Location:** Sidebar → Workflows

**Features:**
- Create and manage automated workflows
- Visual step-by-step execution display
- Schedule workflows (daily, weekly, monthly)
- Track success rates and execution history
- Pause/resume workflows
- Support for 5 step types: command, condition, wait, notification, script

**Workflow Types:**
```
Command    - Execute system commands
Condition  - Branching logic
Wait       - Time-based delays
Notification - Send alerts
Script     - Execute scripts/programs
```

**Creating a Workflow:**
```
1. Click "New Workflow" button
2. Enter workflow name and description
3. Add steps (via edit mode)
4. Set schedule
5. Activate workflow
6. Monitor execution
```

### 4. Terminal Interface

**Location:** Sidebar → Terminal

**Features:**
- Full command line interface
- Command execution with output display
- Built-in command support
- Quick command templates
- Command history
- Terminal controls (copy, clear)

**Built-in Commands:**
```
help          - Show available commands
system        - Display system information
processes     - List running processes
status        - Check agent status
workflows     - Show active workflows
metrics       - Display system metrics
clear         - Clear terminal
version       - Show version info
```

**Custom Commands:**
```bash
# System commands
ls -la
df -h
top
ps aux

# File operations
mkdir, rm, cp, mv
cat, echo
tar, zip

# Network
ping, curl, netstat
```

### 5. Process Explorer

**Location:** Sidebar → Process Explorer

**Features:**
- Real-time process monitoring
- Sort by CPU, Memory, or Name
- Filter by status (running, idle, sleep)
- Process resource usage bars
- Terminate or configure processes
- System statistics

**Columns:**
```
Name          - Process name
PID           - Process ID
CPU           - CPU usage percentage
Memory        - Memory usage in MB
Threads       - Number of threads
Uptime        - Process uptime
Status        - Current status
```

### 6. AI Agent Control

**Location:** Sidebar → AI Agent

**Features:**
- Autonomous agent monitoring
- Real-time status display
- Intent analysis
- Multi-model LLM support
- Performance metrics

---

## API Reference

### REST Endpoints

#### System Control

```bash
# Get system information
GET /api/system/info

# Execute command
POST /api/system/command
{
  "command": "ls -la",
  "timeout": 5000,
  "cwd": "/home/user"
}

# Get system metrics
GET /api/system/metrics
```

#### Workflows

```bash
# List workflows
GET /api/workflows

# Create workflow
POST /api/workflows
{
  "name": "Backup",
  "description": "Daily backup",
  "steps": [...]
}

# Execute workflow
POST /api/workflows/:id/execute

# Get workflow history
GET /api/workflows/:id/history
```

#### AI Agent

```bash
# Get agent status
GET /api/agent/status

# Send intent to agent
POST /api/agent/intent
{
  "text": "What is the status?",
  "context": {}
}

# Get agent thoughts
GET /api/agent/thoughts
```

#### Database

```bash
# Get database statistics
GET /api/database/stats

# Get command history
GET /api/database/command-history?limit=50

# Get agent history
GET /api/database/agent-history?limit=50

# Get metrics history
GET /api/database/metrics-history?limit=100
```

#### Security

```bash
# Get security statistics
GET /api/security/stats

# Get audit log
GET /api/security/audit-log?limit=100&type=command&status=success

# Validate command
POST /api/security/validate-command
{
  "command": "ls -la",
  "userId": "user123"
}

# Generate API key
POST /api/security/generate-key
```

### WebSocket Events

#### Client → Server

```javascript
// Send command
ws.send(JSON.stringify({
  type: 'command:execute',
  payload: { command: 'ls -la' }
}));

// Send intent
ws.send(JSON.stringify({
  type: 'agent:intent',
  payload: { text: 'What is the status?' }
}));
```

#### Server → Client

```javascript
// Receive metrics update
{
  type: 'metrics:update',
  payload: {
    cpu: 35,
    memory: 62,
    disk: 48,
    network: 24
  }
}

// Receive workflow update
{
  type: 'workflow:update',
  payload: {
    workflowId: '1',
    status: 'executing',
    currentStep: 2
  }
}

// Receive agent status
{
  type: 'agent:status',
  payload: {
    status: 'thinking',
    message: 'Processing your request...'
  }
}
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### WebSocket Connection Failed

```
Error: "WebSocket connection failed"

Solution:
1. Check if backend server is running
2. Verify WebSocket URL in console
3. Check firewall settings
4. Try clearing browser cache
5. Restart the server
```

### Metrics Not Updating

```
Issue: Dashboard shows stale metrics

Solution:
1. Check WebSocket connection status (top right)
2. Verify backend is running
3. Check browser console for errors
4. Refresh page (Ctrl+R or Cmd+R)
```

### Commands Not Executing

```
Issue: Terminal commands fail

Solution:
1. Check command syntax
2. Verify permissions
3. Check security whitelist
4. Review API response
5. Check server logs
```

### Performance Issues

```
Solution:
1. Clear browser cache
2. Check system resources
3. Reduce number of open tabs
4. Update browser to latest version
5. Check network latency
```

---

## Production Deployment

### Cloud Deployment Options

#### 1. Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add GROQ_API_KEY
vercel env add GOOGLE_API_KEY
```

#### 2. AWS Deployment

```bash
# Create EC2 instance
aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.large \
  --key-name your-key

# Connect and deploy
ssh -i your-key.pem ec2-user@your-instance
git clone https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent.git
cd Neora-AI-PC-OS-Agent
npm install
npm run build
npm start
```

#### 3. Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t neora-neural-os .
docker run -p 3000:3000 -e NODE_ENV=production neora-neural-os
```

#### 4. DigitalOcean Deployment

```bash
# Create droplet
doctl compute droplet create neora --region nyc3 --image ubuntu-20-04-x64

# SSH into droplet
ssh root@your-droplet-ip

# Install dependencies
apt update && apt install -y nodejs npm

# Clone and deploy
git clone https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent.git
cd Neora-AI-PC-OS-Agent
npm install
npm run build

# Setup PM2 for process management
npm install -g pm2
pm2 start npm --name "neora" -- start
pm2 save
pm2 startup
```

### Production Best Practices

1. **Use HTTPS/SSL:**
   - Install SSL certificate
   - Redirect HTTP to HTTPS
   - Enable HSTS headers

2. **Environment Variables:**
   - Store secrets in .env (never in git)
   - Use different keys for each environment
   - Rotate keys regularly

3. **Monitoring & Logging:**
   - Set up application monitoring
   - Configure logging aggregation
   - Set up alerts for critical issues

4. **Security:**
   - Enable command whitelisting
   - Implement rate limiting
   - Set up API authentication
   - Regular security audits

5. **Backup & Recovery:**
   - Daily database backups
   - Disaster recovery plan
   - Test restore procedures

6. **Performance:**
   - Enable caching headers
   - Use CDN for static assets
   - Optimize database queries
   - Monitor response times

---

## Support & Resources

- **GitHub:** https://github.com/shukriaprinters/Neora-AI-PC-OS-Agent
- **Documentation:** See README.md and other .md files
- **Issues:** Report bugs on GitHub Issues
- **Contributing:** See CONTRIBUTING.md for guidelines

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

**Last Updated:** June 2024
**Version:** 2.0.0
**Status:** Production Ready
