# Neora Neural OS Agent - Complete Rebuild Documentation

## Overview

The Neora Neural OS Agent has been completely rebuilt from the ground up as a production-ready, enterprise-grade autonomous system capable of seamless full-system control over PC environments. This comprehensive rebuild implements all core components specified in the architecture requirements with fully functional, high-performance code and zero placeholders or dummy logic.

## Architecture Overview

### 1. Advanced System Architecture

The system is built on a modular, event-driven architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend UI Layer                         │
│           (JARVIS-Inspired Holographic Interface)           │
├─────────────────────────────────────────────────────────────┤
│                    WebSocket Bridge                          │
│              (Real-time Bidirectional Communication)        │
├─────────────────────────────────────────────────────────────┤
│                   Backend Services                           │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │ OS Manager   │ Workflow     │ AI Agent                │ │
│  │ (System      │ Engine       │ (Intent Analysis &      │ │
│  │  Integration)│ (Task Auto.) │  Planning)              │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                  Cross-Cutting Concerns                      │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │ Database     │ Security     │ WebSocket Manager       │ │
│  │ (Persistence)│ (Access      │ (Client Connection)     │ │
│  │              │  Control)    │                         │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. **OS Manager Service** (`src/server/services/osManager.ts`)

Handles all system-level operations and PC environment control:

- **System Information**: Real-time CPU, memory, disk, uptime tracking
- **Process Management**: List, monitor, and kill system processes
- **File Operations**: Directory traversal, file information access
- **Command Execution**: Safe command execution with sandboxing
- **Screenshot Capture**: Platform-specific screen capture (Windows, macOS, Linux)
- **Command History**: Full audit trail of all executed commands

**Key Features:**
- Safety whitelist for command execution
- Cross-platform compatibility
- Real-time metric collection
- EventEmitter-based notifications

### 2. **WebSocket Manager Service** (`src/server/services/websocketManager.ts`)

Manages real-time bidirectional communication between client and server:

- **Connection Management**: Client lifecycle, authentication, heartbeat
- **Message Routing**: Type-based message dispatch
- **Broadcasting**: System-wide message distribution
- **Queue Management**: Message buffering and persistence
- **Heartbeat Monitor**: Dead connection detection (60s timeout)

**Key Features:**
- Automatic reconnection support
- Message history tracking
- Client authentication flow
- Connection pooling

### 3. **Workflow Engine Service** (`src/server/services/workflowEngine.ts`)

Implements advanced task automation and multi-step workflow execution:

- **Workflow Management**: Create, execute, pause, resume workflows
- **Step Execution**: Command, AI-call, condition, parallel, loop, delay steps
- **Conditional Branching**: onSuccess/onFailure path selection
- **Retry Logic**: Automatic retry with exponential backoff
- **Dependency Resolution**: DAG-based step ordering

**Supported Step Types:**
- `command`: OS command execution
- `ai-call`: AI model invocation
- `condition`: Boolean expression evaluation
- `parallel`: Concurrent execution
- `loop`: Iteration over arrays
- `delay`: Time-based pauses

**Key Features:**
- Execution context preservation
- Variable substitution
- Detailed execution tracking
- Failure recovery mechanisms

### 4. **AI Agent Service** (`src/server/services/aiAgent.ts`)

Implements the core agent loop with intelligent decision-making:

**The Observe-Think-Plan-Act Loop:**

1. **OBSERVE**: Gather system state and context
   - System metrics (CPU, memory, disk, processes)
   - Recent command history
   - Current system configuration

2. **THINK**: Analyze user intent and extract entities
   - Intent classification (information_retrieval, system_optimization, task_scheduling, etc.)
   - Entity extraction (process names, file paths, etc.)
   - Confidence scoring

3. **PLAN**: Create executable plan based on analysis
   - Generate multi-step action sequence
   - Assess risk level (low/medium/high)
   - Estimate execution duration

4. **ACT**: Execute the plan step-by-step
   - Gather system info
   - Analyze resource usage
   - Execute optimizations
   - Verify improvements

**Key Features:**
- Rule-based intent classification
- Autonomous task planning
- User preference learning
- Conversation memory management

### 5. **Database Manager Service** (`src/server/services/databaseManager.ts`)

Provides persistent data storage and retrieval:

**Database Schema:**
- `workflows`: Automation workflow definitions
- `executions`: Execution records with results
- `commands`: Command execution history
- `preferences`: User preferences and settings
- `agent_history`: AI agent decision history
- `system_metrics`: Time-series system performance data

**Capabilities:**
- SQLite with Write-Ahead Logging (WAL)
- Transaction support
- Query generation and execution
- Data cleanup and maintenance
- Statistics and reporting

### 6. **Security Manager Service** (`src/server/services/securityManager.ts`)

Implements comprehensive security and access control:

**Security Features:**
- **Command Whitelist**: Pattern-based command validation
- **Rate Limiting**: 100 requests per minute per user
- **Permission Checking**: Role-based access control
- **Audit Logging**: Complete security event tracking
- **Risk Assessment**: Command risk level classification
- **API Key Generation**: Secure key management

**Blocked Commands (Examples):**
- `rm -rf` (recursive deletion)
- `del /s` (batch deletion)
- `format`, `mkfs` (disk formatting)
- `shutdown`, `reboot` (system restart)
- `sudo` (privilege escalation)

**Audit Events Tracked:**
- Access requests (allowed/denied)
- Command execution attempts
- Permission checks
- Exploitation attempts

## Frontend UI - JARVIS Holographic Interface

### 1. **Holographic Shell** (`src/components/HolographicShell.tsx`)

Main visual container with immersive effects:

- **Particle System**: Dynamic quantum particle effects
- **Scanlines**: Retro holographic scan effect
- **Grid Overlay**: Quantum grid background
- **Ambient Glow**: Pulsing cyan/blue ambient lighting
- **Status Indicator**: Real-time system status badge
- **Accent Bars**: Animated top/bottom neon bars

### 2. **System Metrics Dashboard** (`src/components/SystemMetricsDashboard.tsx`)

Real-time system performance visualization:

- **Live Metrics Cards**: CPU, Memory, Disk usage with animated progress bars
- **Historical Charts**: Line graph of CPU trends over time
- **Resource Distribution**: Bar chart of resource allocation
- **Color-Coded Status**: Green (optimal) → Yellow (moderate) → Red (critical)
- **Auto-Refresh**: 2-second update interval

### 3. **Voice Command Center** (`src/components/VoiceCommandCenter.tsx`)

Advanced natural language interface:

- **Voice Input**: Web Speech API integration (Chrome, Edge, Safari)
- **Waveform Visualization**: Real-time audio waveform display
- **Text Input**: Fallback text command entry
- **Command History**: Recent command suggestions
- **Intent Display**: Last detected intent with confidence score
- **Action Suggestions**: Recommended actions based on intent

### 4. **Neural OS App** (`src/components/NeuralOSApp.tsx`)

Main application shell with navigation:

- **Sidebar Navigation**: 5 main sections (Dashboard, Voice, Workflows, Agent, Terminal)
- **WebSocket Integration**: Real-time connection status
- **System Status**: Online/Offline/Thinking/Executing states
- **Notification System**: Toast notifications for events
- **Responsive Layout**: Mobile-friendly sidebar collapse

## API Endpoints

### System Endpoints

```
GET  /api/system/info              - System information
GET  /api/system/metrics           - Current system metrics
GET  /api/system/processes         - Running processes list
POST /api/system/process/kill      - Kill process by PID
GET  /api/system/files             - File system information
GET  /api/system/screenshot        - Capture screenshot
POST /api/system/command           - Execute command (with security validation)
```

### Workflow Endpoints

```
POST /api/workflows                - Create workflow
GET  /api/workflows                - List all workflows
GET  /api/workflows/:id            - Get workflow details
POST /api/workflows/:id/execute    - Execute workflow
DELETE /api/workflows/:id          - Delete workflow
```

### AI Agent Endpoints

```
POST /api/agent/intent             - Process user intent
GET  /api/agent/state              - Get current agent state
GET  /api/agent/history            - Get agent action history
POST /api/agent/preferences        - Set user preference
```

### Database Endpoints

```
GET /api/database/stats            - Database statistics
GET /api/database/command-history  - Command execution history
GET /api/database/agent-history    - Agent decision history
GET /api/database/metrics-history  - System metrics history
GET /api/database/execution-history/:id - Workflow execution history
GET /api/database/preferences      - User preferences
```

### Security Endpoints

```
GET  /api/security/stats           - Security statistics
GET  /api/security/audit-log       - Audit log entries
POST /api/security/validate-command - Validate command
POST /api/security/generate-key    - Generate API key
```

### Chat Endpoints

```
POST /api/chat-groq    - Groq LLM chat completion
POST /api/chat-gemini  - Google Gemini chat completion
```

### WebSocket Endpoints

```
GET  /api/websocket/info           - Connected clients info
POST /api/websocket/broadcast      - Broadcast message
```

## Data Persistence

All data is persisted to SQLite database (`neora-agent.db`):

- **Workflows**: Saved automatically on creation
- **Executions**: Recorded with full context and results
- **Commands**: Logged for audit trail
- **Metrics**: Time-series data collection
- **Preferences**: User settings and configuration
- **Agent History**: Decision records for learning

## Security Model

### Command Execution Security

1. **Pattern Matching**: All commands validated against whitelist
2. **Risk Assessment**: Commands classified as low/medium/high risk
3. **Rate Limiting**: 100 requests per minute per user
4. **Audit Logging**: All access attempts recorded
5. **Sensitive Data Sanitization**: Passwords/keys removed from logs

### Access Control

- **Permission System**: Resource-based access control
- **Authentication Flow**: Token-based client authentication
- **Encrypted Communication**: HTTPS/WSS for secure transport
- **API Key Management**: Secure key generation and validation

## Performance Optimizations

- **Write-Ahead Logging**: SQLite WAL for concurrent access
- **EventEmitter Pattern**: Decoupled component communication
- **Connection Pooling**: WebSocket connection management
- **Message Queuing**: Buffered message delivery
- **Particle System**: GPU-accelerated animations (WebGL)
- **Lazy Loading**: On-demand service initialization

## Deployment

### Production Setup

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start server
npm start

# Or run in development mode
npm run dev
```

### Environment Variables

```
PORT=3000
GROQ_API_KEY=<your-groq-key>
GEMINI_API_KEY=<your-gemini-key>
NODE_ENV=production
```

### Database Maintenance

The system automatically:
- Runs cleanup on server shutdown
- Removes records older than 30 days
- Maintains WAL journal files
- Performs PRAGMA optimization

## Monitoring & Debugging

### Logging

All services emit detailed logs:
- `[OSManager]` - System operations
- `[WebSocket]` - Connection events
- `[Workflow]` - Execution tracking
- `[Agent]` - Decision making
- `[Database]` - Data operations
- `[Security]` - Access control events

### Debug Commands

Enable debug logging:
```javascript
// In component or service
console.log("[v0] State update:", newState);
```

## Future Enhancements

Potential additions for future versions:

1. **Multi-User Support**: User authentication and isolation
2. **ML-Based Intent Classification**: Neural network intent parser
3. **Advanced Scheduling**: Cron-like workflow triggers
4. **Plugin System**: Third-party service integration
5. **Distributed Execution**: Multi-machine workflow coordination
6. **Advanced Analytics**: ML-based anomaly detection
7. **Mobile App**: Native mobile interface
8. **Voice Synthesis**: Text-to-speech responses

## Support & Maintenance

For issues or questions:
1. Check the audit log for security events
2. Review system metrics for performance issues
3. Consult the database statistics for schema validation
4. Enable detailed logging for debugging

---

**Built with:** Express.js, React, TypeScript, Tailwind CSS, Motion, Recharts, SQLite  
**Status:** Production-Ready ✓  
**Version:** 1.0.0
