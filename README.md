👁️ Trinetra AI

The Third Eye for Autonomous Reliability Engineering
AI-native observability, intelligent incident detection, and conversational recovery workflows for modern applications.

⸻

🌌 Overview

Trinetra AI is a modern AI-powered observability and SRE (Site Reliability Engineering) platform designed to monitor applications in real time, detect failures autonomously, explain incidents using AI, and guide teams through recovery workflows.

Unlike traditional dashboards that only display metrics, Trinetra actively interprets telemetry streams and converts operational noise into actionable intelligence.

Built during the AI Hackathon for Builders 2026 🚀

⸻

✨ Features

🔌 External Telemetry SDK

Connect any application to Trinetra in minutes.

The SDK can stream:

* API requests
* latency metrics
* system errors
* operational events

directly into the Trinetra observability engine.

⸻

📡 Real-Time Observability

Monitor:

* request throughput
* latency
* error rates
* service degradation
* anomaly spikes
* application failures

All telemetry updates in real time.

⸻

🧠 AI Incident Analysis

Powered by Google Gemini AI.

Trinetra can:

* analyze outages
* explain root causes
* summarize incidents
* simplify technical issues
* recommend recovery actions

⸻

🚨 Autonomous Incident Detection

Detects:

* latency spikes
* repeated 5xx failures
* backend instability
* degraded AI provider responses
* service health degradation

Incident lifecycle:

investigating → identified → monitoring → resolved

⸻

💬 Ask Trinetra (AI Copilot)

A conversational AI reliability assistant that:

* explains outages
* answers telemetry questions
* simplifies engineering concepts
* recommends remediation steps

Inspired by the simplicity and conversational feel of ChatGPT.

⸻

🛠 Recovery Workflow Engine

Supports AI-guided recovery simulations:

* request queuing
* retry orchestration
* fallback model switching
* infrastructure stabilization
* service recovery tracking

⸻

🌐 Connected Applications

Track applications actively streaming telemetry into Trinetra.

Each connected application includes:

* live status
* latency monitoring
* request metrics
* operational health

⸻

🏗 Architecture

External Application
        ↓
Trinetra SDK
        ↓
Telemetry API
        ↓
Telemetry Store
        ↓
Incident Detection Engine
        ↓
Gemini AI Analysis
        ↓
Realtime Dashboard
        ↓
Recovery Workflows

⸻

⚡ Tech Stack

Frontend

* Next.js 15
* TypeScript
* Tailwind CSS v4
* Framer Motion
* Recharts

AI

* Google Gemini API
* Gemini 1.5 Flash

Observability

* Custom telemetry ingestion engine
* Incident detection engine
* Realtime telemetry polling
* AI reasoning pipeline

Deployment

* Vercel

⸻

🎨 Design Philosophy

Trinetra follows a:

* monochrome minimal UI
* calm operational interface
* premium enterprise aesthetic
* Apple-inspired visual system

Inspired by:

* ChatGPT
* Linear
* Vercel
* Stripe
* Apple

⸻

🔌 SDK Integration

1. Include SDK

<script src="/js/trinetra.js"></script>

⸻

2. Initialize SDK

Trinetra.init({
  endpoint: "https://trinetra-ai-ten.vercel.app/api/telemetry",
  projectName: "Nagrik AI"
})

⸻

3. Track Requests

Trinetra.captureRequest({
  route: "/chat",
  method: "POST",
  status: 200,
  latency: 320,
  service: "gemini"
})

⸻

4. Track Errors

Trinetra.captureError(error)

⸻

📦 Example Telemetry Packet

{
  "projectName": "Nagrik AI",
  "type": "request",
  "route": "/chat",
  "method": "POST",
  "status": 200,
  "latency": 320,
  "service": "gemini",
  "timestamp": 1716540000000
}

⸻

🚀 Local Development

Clone Repository

git clone https://github.com/YOUR_USERNAME/trinetra-ai.git
cd trinetra-ai

⸻

Install Dependencies

npm install

⸻

Configure Environment Variables

Create:

.env.local

Add:

GOOGLE_API_KEY=your_google_api_key

⸻

Start Development Server

npm run dev

⸻

🌍 Live Deployment

Trinetra Dashboard

Live Trinetra Platform￼

⸻

Connected Demo Application

Nagrik AI Demo App￼

⸻

🧪 Demo Flow

1. Healthy System

Dashboard starts in a stable operational state.

⸻

2. External Traffic

Nagrik AI streams telemetry into Trinetra.

⸻

3. Incident Detection

Failures or latency spikes trigger incidents automatically.

⸻

4. AI Reasoning

Gemini analyzes telemetry and explains the root cause.

⸻

5. Conversational Debugging

Users interact with Ask Trinetra for operational guidance.

⸻

6. Recovery Workflow

AI remediation actions stabilize the system.

⸻

🔒 Reliability & Fallback Design

Trinetra includes deterministic fallback systems.

If:

* Gemini API fails
* API key is missing
* network becomes unavailable
* rate limits occur

the platform automatically switches to heuristic operational reasoning to preserve stability.

⸻

🌌 Vision

Traditional observability tools surface alerts.

Trinetra goes further.

It interprets telemetry, reasons about failures, explains incidents in human language, and guides operational recovery using AI-native workflows.

Build the future operating system for autonomous reliability engineering.

⸻

👨‍💻 Author

Kshitij Renge

⸻

📜 License

MIT License
