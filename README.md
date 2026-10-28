# 🌍 EcoScan — Clothing Carbon Footprint Scanner & Rewards

EcoScan is a full-stack web application designed for **Reewild** that empowers users to understand the environmental impact of their clothing choices, view life-cycle carbon scores, earn **Eco-Reward Points**, and redeem sustainable partner offers.

---

## 📋 Table of Contents

1. [Overview & User Story](#overview--user-story)
2. [Tech Stack](#tech-stack)
3. [Architecture & Project Structure](#architecture--project-structure)
4. [Carbon Footprint Assumptions & Scoring](#carbon-footprint-assumptions--scoring)
5. [Eco-Rewards Calculation Formula](#eco-rewards-calculation-formula)
6. [Setup & Installation Instructions](#setup--installation-instructions)
7. [Running the Application](#running-the-application)
8. [Automated Testing](#automated-testing)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Product & Technical Enhancements](#product--technical-enhancements)
11. [Deployment](#deployment)
12. [Submission Details](#submission-details)

---

## 💡 Overview & User Story

1. **Capture or Upload**: Users upload a photo of clothing items or snap a picture directly via live webcam/mobile camera.
2. **Garment Recognition**: Vision model identifies clothing items, fabric materials, and condition (integrated with Azure AI Foundry GPT-4 Vision, standard OpenAI, and an automatic offline heuristic fallback).
3. **Carbon Scoring**: Calculates estimated carbon footprint (kg CO2e) per item and for the entire scan using Life Cycle Assessment (LCA) benchmarks.
4. **Eco-Savings & Equivalencies**: Quantifies carbon saved compared to conventional baselines and translates savings into real-world equivalents (car km avoided, smartphone charges, tree absorption days).
5. **Reward Points & Partner Offers**: Grants eco-reward points to an in-memory user wallet and unlocks redeemable partner offers (Patagonia Worn Wear, Thrift+, Allbirds, Guppyfriend, Tree-Nation, Reewild).

---

## 🔧 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Vitest, React Testing Library.
- **Backend**: Python 3.14 / FastAPI, Uvicorn, Pydantic v2, Pillow (PIL), HTTPX, Pytest, Pytest-Asyncio.
- **Image Recognition**: Azure AI Foundry (Azure OpenAI Service) GPT-4 Vision model, with OpenAI fallback and built-in heuristic vision engine.
- **Storage**: In-memory thread-safe store (`MemoryStore` singleton) for baselines, multipliers, scans, user wallet, and offers.

---

## 📂 Architecture & Project Structure

```
ecoscan/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST endpoints (health, scan, offers, items)
│   │   ├── models/          # Pydantic models (clothing, offer)
│   │   ├── services/        # Business logic (carbon, rewards, vision)
│   │   ├── storage/         # In-memory thread-safe store
│   │   ├── config.py        # Typed application settings
│   │   └── main.py          # FastAPI application entrypoint & CORS
│   ├── tests/               # 21 automated pytest test cases
│   ├── requirements.txt     # Python dependencies
│   └── pytest.ini           # Pytest settings
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Upload, Camera, Results, Offers, Modals)
│   │   ├── services/        # API client layer
│   │   ├── types/           # TypeScript interfaces
│   │   ├── test/            # Vitest + React Testing Library tests
│   │   └── App.tsx          # Main application layout
│   ├── package.json
│   └── vite.config.ts
├── .env.example             # Global environment configuration template
└── README.md
```

---

## 🌱 Carbon Footprint Assumptions & Scoring

Emissions reflect cradle-to-grave Life Cycle Assessment (LCA) benchmarks from WRAP (Waste & Resources Action Programme) and the UK Carbon Trust.

### 1. Baseline Scores per Garment Type

| Item | Estimated Carbon Score (kg CO2e) | Notes |
|:---|:---:|:---|
| **T-shirt** | **5.0** | Baseline cotton jersey crewneck |
| **Jeans** | **10.0** | Heavy denim trousers |
| **Jacket** | **15.0** | Outerwear / insulated technical coat |
| **Shoes** | **8.0** | Everyday sneakers / footwear |
| **Dress** | **11.5** | Woven midi dress |
| **Sweater** | **13.0** | Knit pullover / jumper |
| **Hoodie** | **12.0** | Heavy fleece hoodie |
| **Shorts** | **4.5** | Casual shorts |
| **Skirt** | **6.0** | Casual skirt |
| **Pants** | **8.5** | Chinos / tailored trousers |
| **Coat** | **20.0** | Heavy winter wool coat |
| **Shirt** | **6.5** | Collared button-down shirt |
| **Accessories** | **3.0** | Scarf, cap, or belt |
| **Other** | **7.0** | General apparel benchmark |

### 2. Material Lifecycle Multipliers

- **Organic Cotton**: `0.70` (no synthetic pesticides, 91% lower blue water usage)
- **Conventional Cotton**: `1.00` (baseline)
- **Recycled Polyester (rPET)**: `0.55` (diverts plastic, 45% less energy)
- **Virgin Polyester**: `1.25` (fossil-fuel intensive synthesis)
- **Denim**: `1.15` (energy & water intensive finishing)
- **Wool**: `1.40` (livestock agricultural emissions)
- **Linen**: `0.60` (resilient low-irrigation flax)
- **Leather**: `2.10` (livestock methane + chemical tanning)
- **Silk**: `1.30` (sericulture energy inputs)
- **Synthetic Blend**: `1.10` (mixed synthetic blend)

### 3. Condition & Circularity Multipliers

- **Second-Hand / Pre-Loved**: `0.15` (avoids 85% of primary production)
- **Vintage**: `0.20` (long product life amortizes emissions)
- **Upcycled / Repaired**: `0.25` (mending keeps clothes in circulation)
- **Sustainable Brand**: `0.65` (certified low-carbon supply chain)
- **New Standard**: `1.00` (standard retail purchase)
- **Fast Fashion**: `1.10` (low durability, rapid landfill turnover)

---

## 🧮 Eco-Rewards Calculation Formula

1. **Estimated Carbon Footprint**:
   `Estimated CO2 (kg) = Baseline Category Score * Material Multiplier * Condition Multiplier`

2. **Conventional Benchmark & Eco-Savings**:
   `Conventional Benchmark = Baseline Category Score * 1.05`
   `Eco Savings (kg) = max(0.5, Conventional Benchmark - Estimated CO2)`

3. **Eco-Reward Points**:
   `Scan Points = clamp(round(Total Savings (kg) * 10 + 15), 25, 500)`

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ (Tested on Node.js v24)
- npm or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ecoscan.git
cd ecoscan
```

### 2. Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```

*(Optional)* To use Azure AI Foundry GPT-4 Vision, provide your Azure credentials in `backend/.env`:
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_azure_api_key_here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
```
*Note: If no API keys are provided, EcoScan automatically activates its intelligent heuristic vision engine for seamless local evaluation.*

### 3. Install Backend Dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 💻 Running the Application

### 1. Start the Backend Server
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Backend API: `http://localhost:8000`
- Interactive OpenAPI Docs (Swagger): `http://localhost:8000/api/v1/docs`
- Health Check: `http://localhost:8000/api/v1/health`

### 2. Start the Frontend Server
```bash
cd frontend
npm run dev
```
- Access the web application at: **`http://localhost:5173`**

---

## 🧪 Automated Testing

### Run Backend Test Suite
```bash
cd backend
./venv/bin/pytest -v
```
**21 tests passing**, validating:
- Baseline retrieval & updates
- LCA carbon formulas and material/condition multipliers
- Equivalencies (car km, smartphone charges, tree days)
- Rewards calculation, clamping, and user tier promotions
- Image security validation (corrupted files, size limits)
- File upload and base64 webcam scan endpoints
- In-memory store concurrency and offer redemption logic

### Run Frontend Test Suite
```bash
cd frontend
npx vitest run
```
**6 component tests passing**, validating:
- Navbar points and tier indicators
- Scan results rendering and care tips
- Offers catalog filtering, points unlock math, and redemption modal interactions

### Run Production Build Check
```bash
cd frontend
npm run build
```

---
## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/v1/health` | Health check & active vision provider status |
| `POST` | `/api/v1/scan` | Upload clothing image file (multipart/form-data) |
| `POST` | `/api/v1/scan/base64` | Scan base64 image (webcam capture) |
| `GET` | `/api/v1/offers` | Get curated partner offers with user unlock status |
| `POST` | `/api/v1/offers/redeem` | Redeem points for partner voucher code |
| `GET` | `/api/v1/offers/wallet` | Get user wallet balance and tier status |
| `GET` | `/api/v1/items/carbon-scores` | Get baseline scores & multipliers |
| `POST` | `/api/v1/items/carbon-scores` | Update category baseline score in-memory |
| `POST` | `/api/v1/items/calculate` | Simulate carbon score for custom item parameters |

---

## 🌟 Product & Technical Enhancements

### 1. Scaling the Backend for Large User Loads
- **Distributed Cache**: Implement Redis for caching clothing category baselines and frequently scanned garment items via perceptual image hashing (pHash).
- **Asynchronous Processing Queue**: Decouple image processing using Celery or ARQ with Redis/RabbitMQ. Users upload images directly to cloud storage (S3/Azure Blob), triggering asynchronous vision analysis with real-time WebSocket progress updates.
- **Stateless Database Integration**: Transition from in-memory dictionaries to PostgreSQL / MongoDB for persistent user profiles, scan histories, and partner vouchers.

### 2. Enhancing the Carbon Scoring Model
- **Primary LCA Database Integrations**: Connect with verified Life Cycle Assessment databases such as Higg Materials Sustainability Index (Higg MSI) and Ecoinvent for precise regional fiber impacts.
- **Digital Product Passports (DPP)**: Read EU Digital Product Passport QR codes or garment RFID tags to extract exact supply chain logs, textile percentages, and dyeing facilities.
- **Gram-Weight Calibration**: Allow users to specify garment weight for gram-accurate calculations rather than category averages.

### 3. Enhancing User Experience
- **Wardrobe Impact Tracker**: A virtual closet dashboard tracking cumulative carbon avoided over time and showing seasonal progress.
- **Circularity Recommendations**: When high-impact fast fashion items are detected, suggest local repair hubs, tailor discounts, or textile recycling collection points.
- **Community Rewilding Challenges**: Enable users to pool points toward collective tree planting or wildlife corridor restoration projects.

### 4. Real-Time External API Integrations
- **Shopify & E-Commerce Plugin**: Integrate EcoScan into checkout pages of partner stores to display garment footprints before purchase.
- **Direct Registry Retirement**: Connect directly with Tree-Nation and Verra APIs to retire verified carbon credits when points are redeemed.

---

## 📲 Live Deployments

- **GitHub Repository**: [https://github.com/varunx89/ecoscan](https://github.com/varunx89/ecoscan)
- **Live Web Application (Frontend)**: [https://ecoscan-frontend-ztee.onrender.com](https://ecoscan-frontend-ztee.onrender.com)
- **Live API Documentation (Swagger UI)**: [https://ecoscan-api-vd49.onrender.com/api/v1/docs](https://ecoscan-api-vd49.onrender.com/api/v1/docs)
- **Live API Health Check**: [https://ecoscan-api-vd49.onrender.com/api/v1/health](https://ecoscan-api-vd49.onrender.com/api/v1/health)

### Deployment Configuration
- **Backend**: Deployed to Render via `render-cli` (`render.yaml` Blueprint, free tier web service, running Uvicorn on Python).
- **Frontend**: Deployed to Render Static Sites with auto-routing to the live backend API, and configured for Vercel via `vercel.json` rewrites.

---

## 📬 Submission Details

- **Candidate Submission**: Reewild Full-Stack Engineer Take-Home Challenge
- **Email Contact**: `rithin.chalumuri@reewild.com`
