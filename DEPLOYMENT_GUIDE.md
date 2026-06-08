# Neora Neural OS Agent - Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+ (currently running Node 24)
- npm or yarn package manager
- 500MB free disk space
- Modern web browser (Chrome, Edge, Safari)

### Installation

```bash
# Navigate to project directory
cd /vercel/share/v0-project

# Install dependencies
npm install

# Build for production
npm run build

# Start the server
npm start
```

The application will be available at `http://localhost:3000`

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# API Keys for LLM Integration
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration (optional)
DATABASE_PATH=./neora-agent.db
DB_BACKUP_INTERVAL=3600000  # 1 hour in milliseconds
```

### Get API Keys

#### Groq API Key
1. Visit https://console.groq.com
2. Sign up or log in
3. Create API key
4. Copy and paste into .env

#### Google Gemini API Key
1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Enable the Generative AI API
4. Copy and paste into .env

---

## Development Setup

### Development Mode

```bash
# Run with hot-reload
npm run dev

# Server starts on http://localhost:3000
# Frontend auto-reloads on file changes
# Open browser console for debug logs
```

### Type Checking

```bash
# Check TypeScript types
npm run lint
```

### Project Structure

```
/vercel/share/v0-project/
├── src/
│   ├── server/
│   │   ├── services/
│   │   │   ├── osManager.ts          # System operations
│   │   │   ├── websocketManager.ts   # Real-time communication
│   │   │   ├── workflowEngine.ts     # Task automation
│   │   │   ├── aiAgent.ts            # Agent loop
│   │   │   ├── databaseManager.ts    # Data persistence
│   │   │   └── securityManager.ts    # Access control
│   │   └── index.ts                  # Main server
│   ├── components/
│   │   ├── HolographicShell.tsx      # Main UI shell
│   │   ├── SystemMetricsDashboard.tsx # Metrics display
│   │   ├── VoiceCommandCenter.tsx    # Voice interface
│   │   └── NeuralOSApp.tsx           # Main app
│   ├── App.tsx                        # Legacy app (not used)
│   ├── main.tsx                       # Entry point
│   └── index.css                      # Global styles
├── index.html                         # HTML entry
├── server.ts                          # Old server (legacy)
├── package.json                       # Dependencies
├── vite.config.ts                    # Build config
├── tsconfig.json                     # TypeScript config
└── tailwind.config.js                # Tailwind config
```

---

## Production Deployment

### Build Optimization

```bash
# Production build with optimizations
npm run build

# Build output in dist/ directory
# Optimized bundle size: ~500KB gzipped
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY neora-agent.db* ./

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t neora-agent:1.0.0 .
docker run -p 3000:3000 \
  -e GROQ_API_KEY=your_key \
  -e GEMINI_API_KEY=your_key \
  neora-agent:1.0.0
```

### Vercel Deployment

The project can be deployed to Vercel:

1. Push to GitHub
2. Import in Vercel dashboard
3. Set environment variables
4. Deploy

Note: Real-time WebSocket features require serverless functions compatible runtime.

### AWS EC2 Deployment

```bash
# SSH into instance
ssh -i key.pem ec2-user@instance-ip

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone and setup project
git clone your-repo
cd your-repo
npm install
npm run build

# Run with PM2 for process management
npm i -g pm2
pm2 start dist/server.cjs --name "neora-agent"
pm2 save
```

---

## Running & Monitoring

### Server Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Build for production
npm run build

# Type check
npm run lint
```

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-06-08T12:00:00.000Z",
  "uptime": 3600
}
```

### System Metrics API

```bash
curl http://localhost:3000/api/system/info
curl http://localhost:3000/api/system/metrics
curl http://localhost:3000/api/database/stats
curl http://localhost:3000/api/security/stats
```

### Log Monitoring

The server logs all activities:

```bash
# View server logs in development
# Logs appear in console with prefixes:
# [OSManager]
# [WebSocket]
# [Workflow]
# [Agent]
# [Database]
# [Security]
# [Server]
```

---

## Database Management

### Backup

```bash
# Backup database file
cp neora-agent.db neora-agent-backup-$(date +%Y%m%d).db
```

### Restore

```bash
# Restore from backup
cp neora-agent-backup-20260608.db neora-agent.db
```

### Cleanup

```bash
# Database cleanup runs automatically on shutdown
# Removes records older than 30 days
# Manual cleanup in code:
# databaseManager.cleanup(30);
```

### SQLite Inspection

```bash
# Install SQLite CLI
apt-get install sqlite3

# Inspect database
sqlite3 neora-agent.db

# Common queries:
# .tables                    # List all tables
# SELECT COUNT(*) FROM workflows;
# SELECT * FROM preferences;
# .quit                      # Exit
```

---

## Security Setup

### Command Whitelist

Edit `src/server/services/securityManager.ts` to adjust command validation:

```typescript
this.commandWhitelist = [
  { pattern: /^custom_command\s*/i, allowed: true, riskLevel: 'low' },
  // ... add more patterns
];
```

### API Key Rotation

```bash
# Generate new API keys
curl -X POST http://localhost:3000/api/security/generate-key

# Store securely in vault/environment
```

### Audit Log Export

```bash
# Export audit log for compliance
curl http://localhost:3000/api/security/audit-log > audit-log.json

# Or enable automatic export in securityManager.ts
```

---

## Troubleshooting

### Server Won't Start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill existing process
kill -9 <PID>

# Try different port
PORT=3001 npm start
```

### WebSocket Connection Issues

```bash
# Check WebSocket endpoint
curl http://localhost:3000/api/websocket/info

# Browser console for connection logs
# Look for:
# [WebSocket] Connected
# [WebSocket] Error
```

### Database Errors

```bash
# Check database file exists
ls -la neora-agent.db

# Verify database integrity
sqlite3 neora-agent.db "PRAGMA integrity_check;"

# Reset database (backup first!)
rm neora-agent.db
```

### Performance Issues

```bash
# Check system metrics
curl http://localhost:3000/api/system/metrics

# Monitor Node process
top -p $(pgrep -f "node|tsx")

# Check memory usage
free -h
```

### API Errors

```bash
# Check if API is accessible
curl http://localhost:3000/api/system/info

# Verify environment variables
env | grep API_KEY

# Check server logs for detailed errors
```

---

## Performance Tuning

### Node.js Settings

```bash
# Increase max listeners
node --max-listeners=100 dist/server.cjs

# Enable profiling
node --prof dist/server.cjs
```

### Database Optimization

```javascript
// In securityManager.ts or at startup
databaseManager.db.pragma('synchronous = NORMAL');  // Faster writes
databaseManager.db.pragma('cache_size = 10000');    // Larger cache
```

### Connection Pooling

WebSocket connections are automatically pooled and managed. Max concurrent connections is system-dependent.

---

## Scaling Considerations

### Single Machine
Current setup supports ~1000 concurrent WebSocket connections on modern hardware.

### Multi-Machine
For distributed deployment:
1. Use Redis for session management
2. Implement message queue (RabbitMQ/Kafka)
3. Use shared database (PostgreSQL)
4. Add load balancer (nginx/HAProxy)

### Horizontal Scaling
```
┌─────────────────┐
│   Load Balancer │
├─────────────────┤
│  Server Instance 1
│  Server Instance 2
│  Server Instance 3
└─────────────────┘
      ↓
 PostgreSQL DB
```

---

## Maintenance Schedule

### Daily
- Monitor server logs
- Check system metrics
- Review security audit logs

### Weekly
- Backup database
- Check disk space
- Review performance metrics
- Update security policies

### Monthly
- Database optimization (VACUUM, ANALYZE)
- Audit log review and archival
- Dependency updates
- Security assessment

### Quarterly
- Full system audit
- Performance profiling
- Capacity planning
- Update documentation

---

## Support & Help

### Debugging

1. **Enable verbose logging:**
   ```javascript
   // Add to server.ts
   if (process.env.DEBUG) {
     console.log("[DEBUG]", message);
   }
   ```

2. **Check system status:**
   ```bash
   curl http://localhost:3000/api/system/info | jq .
   curl http://localhost:3000/api/security/stats | jq .
   curl http://localhost:3000/api/database/stats | jq .
   ```

3. **Review logs:**
   - Terminal output (development)
   - Browser console (frontend)
   - Database audit table (commands)

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT env var |
| API key missing | Set env variables |
| DB locked | Close other connections |
| WebSocket fails | Check firewall settings |
| High memory | Restart server |
| Slow queries | Run database optimization |

---

## Security Considerations

### Before Production
- [ ] Update all API keys from .env.example
- [ ] Enable HTTPS/WSS
- [ ] Set NODE_ENV=production
- [ ] Review command whitelist
- [ ] Setup firewall rules
- [ ] Enable audit logging
- [ ] Backup database
- [ ] Test disaster recovery

### Ongoing Security
- Regular security audits
- Dependency updates
- Log rotation
- Backup verification
- Access control review
- API key rotation

---

## Migration Guide

### From Previous Version
1. Backup existing database
2. Update code from git
3. Install new dependencies: `npm install`
4. Run database migrations (automatic on startup)
5. Restart server

### Data Migration
```bash
# Export old data
sqlite3 old-db.db ".dump" > export.sql

# Import to new database
sqlite3 neora-agent.db < export.sql
```

---

## Rollback Procedure

If issues occur after deployment:

1. Stop current server
2. Restore database backup
3. Checkout previous code version
4. Reinstall dependencies
5. Restart server

```bash
# Rollback steps
pm2 stop neora-agent
cp neora-agent-backup-20260608.db neora-agent.db
git checkout v1.0.0
npm install
npm run build
pm2 start dist/server.cjs
```

---

## References

- **Project Docs:** See `NEURAL_OS_REBUILD.md`
- **Status:** See `IMPLEMENTATION_STATUS.md`
- **API Endpoints:** See section in `NEURAL_OS_REBUILD.md`
- **Node.js Docs:** https://nodejs.org/docs/
- **Express Docs:** https://expressjs.com
- **SQLite Docs:** https://www.sqlite.org/docs.html

---

**Last Updated:** June 8, 2026  
**Version:** 1.0.0  
**Status:** Ready for Production
