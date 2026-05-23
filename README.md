# 👁️ Trinetra AI
> The Third Eye for Autonomous API Reliability
Trinetra AI is an AI-native observability and incident response platform built for modern engineering teams.
It continuously:
- monitors APIs
- analyzes telemetry
- detects anomalies
- explains outages using AI
- recommends remediation workflows
- stabilizes infrastructure
Built during the AI Hackathon for Builders 🚀
---
# ✨ Features
## 🔥 Real-Time Telemetry Monitoring
- Live API request tracking
- Latency monitoring
- Error detection
- Traffic spike analysis
- Operational health metrics
## 🧠 AI-Powered Incident Analysis
Trinetra uses Google Gemini AI to:
- identify root causes
- summarize incidents
- explain outages
- recommend recovery actions
- provide contextual SRE reasoning
## 🚨 Autonomous Incident Detection
Detects:
- 5xx failure spikes
- latency degradation
- authentication storms
- database exhaustion
- OpenAI/Gemini degradation
## 🔌 Lightweight Telemetry SDK
External applications can stream telemetry into Trinetra using the built-in SDK.
Example:
```ts
Trinetra.captureRequest({
  route: "/chat",
  method: "POST",
  status: 500,
  latency: 4200,
})

🛠 AI Recovery Action Center

Operational remediation workflows:

* restart services
* enable fallback providers
* scale infrastructure
* stabilize traffic

💬 Ask Trinetra

An AI SRE copilot for conversational debugging and operational insights.

⸻

🏗 Architecture

Demo App
   ↓
Trinetra SDK
   ↓
/api/telemetry
   ↓
Telemetry Store
   ↓
Incident Detection Engine
   ↓
Gemini AI Analysis
   ↓
Dashboard + Recovery Workflows

⸻

⚡ Tech Stack

* Next.js 15
* TypeScript
* Tailwind CSS v4
* Google Gemini API
* Recharts
* Lucide Icons
* Vercel

⸻

🎯 Demo Scenarios

Trinetra includes guided failure simulations:

* OpenAI API Meltdown
* Database Exhaustion
* Traffic Surge Cascade
* Authentication Failure Storm

Each scenario triggers:

* telemetry degradation
* incident escalation
* AI analysis
* recovery workflows

⸻

🚀 Local Setup

1. Clone Repository

git clone https://github.com/YOUR_USERNAME/trinetra-ai.git
cd trinetra-ai

2. Install Dependencies

npm install

3. Configure Environment Variables

Create .env.local

GOOGLE_API_KEY=your_google_api_key

4. Start Development Server

npm run dev

⸻

🧪 Demo Flow

1. Launch Trinetra Dashboard
2. Trigger a failure scenario
3. Observe telemetry degradation
4. Watch AI incident analysis activate
5. Execute remediation workflows
6. Stabilize production environment

⸻

🔒 Fail-Safe AI Architecture

Trinetra includes deterministic fallback systems.

If:

* Gemini API fails
* rate limits occur
* network becomes unavailable

The platform automatically switches to heuristic SRE reasoning to ensure demo reliability.

⸻

🌌 Vision

Modern observability tools detect incidents.

Trinetra goes further:

* reasoning
* diagnosis
* operational guidance
* AI-assisted recovery

The goal is to build the future of autonomous reliability engineering.

⸻

👨‍💻 Author
Kshitij Renge
