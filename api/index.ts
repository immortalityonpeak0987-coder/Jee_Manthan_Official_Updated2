import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const app = express();

// Increase payload limit for base64 image uploads
app.use(express.json({ limit: "50mb" }));

const DB_FILE = process.env.VERCEL ? path.join("/tmp", "db.json") : path.join(process.cwd(), "db.json");
let memoryDb: { users: Record<string, any> } = { users: {} };

try {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb));
  } else {
    memoryDb = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  }
} catch (e) {
  console.warn("Could not access or write to DB file, using in-memory fallback.", e);
}

const saveDb = (db: any) => {
  memoryDb = db;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db));
  } catch (e) {
    console.warn("Could not write to DB file. Changes are in-memory only.");
  }
};

// Groq API Configuration from environment (set in Vercel or .env)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// In-memory diagram cache
const diagramCache = new Map<string, string>();

// Pre-compiled high-quality vector templates for core JEE diagrams
const getPrecompiledDiagram = (prompt: string): string | null => {
  const p = prompt.toLowerCase();
  
  // 1. Inclined plane / Free Body Diagram
  if (p.includes("incline") || p.includes("plane") || p.includes("block") || p.includes("friction") || p.includes("free body") || p.includes("fbd")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 360" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090d16"/><stop offset="100%" stop-color="#131d2e"/>
        </linearGradient>
        <marker id="arrCyan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#38bdf8" /></marker>
        <marker id="arrRed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#f43f5e" /></marker>
        <marker id="arrGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#10b981" /></marker>
        <marker id="arrAmber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#fbbf24" /></marker>
      </defs>
      <rect width="650" height="360" rx="14" fill="url(#bgGrad)" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="25" y="20" width="600" height="36" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="40" y="44" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Free Body Diagram: Block on Inclined Plane</text>
      
      <!-- Inclined plane wedge -->
      <polygon points="100,280 540,110 540,280" fill="#1e293b" stroke="#475569" stroke-width="2"/>
      <line x1="80" y1="280" x2="560" y2="280" stroke="#334155" stroke-width="3"/>
      
      <!-- Incline angle theta -->
      <path d="M 180,280 A 80,80 0 0,0 174,251" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
      <text x="195" y="270" fill="#fbbf24" font-family="system-ui" font-size="14" font-weight="bold">&#952;</text>
      
      <!-- Block of mass m -->
      <polygon points="310,185 368,162 388,213 330,236" fill="#334155" stroke="#38bdf8" stroke-width="2.5"/>
      <text x="342" y="206" fill="#ffffff" font-family="system-ui" font-size="14" font-weight="extrabold">m</text>
      
      <!-- Vectors from center of mass (349, 199) -->
      <!-- Gravity mg -->
      <line x1="349" y1="199" x2="349" y2="275" stroke="#f43f5e" stroke-width="3" marker-end="url(#arrRed)"/>
      <text x="357" y="268" fill="#f43f5e" font-family="system-ui" font-size="13" font-weight="bold">mg (Weight)</text>
      
      <!-- Normal reaction N -->
      <line x1="349" y1="199" x2="378" y2="128" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrCyan)"/>
      <text x="388" y="138" fill="#38bdf8" font-family="system-ui" font-size="13" font-weight="bold">N = mg cos &#952;</text>
      
      <!-- Friction f (opposing motion) -->
      <line x1="349" y1="199" x2="275" y2="228" stroke="#10b981" stroke-width="3" marker-end="url(#arrGreen)"/>
      <text x="225" y="246" fill="#10b981" font-family="system-ui" font-size="13" font-weight="bold">f = &#956;N</text>
      
      <!-- Down-plane component mg sin theta -->
      <line x1="349" y1="199" x2="415" y2="173" stroke="#fbbf24" stroke-dasharray="4,3" stroke-width="2.5" marker-end="url(#arrAmber)"/>
      <text x="425" y="180" fill="#fbbf24" font-family="system-ui" font-size="12" font-weight="bold">mg sin &#952;</text>
      
      <!-- Bottom formula pill -->
      <rect x="25" y="305" width="600" height="36" rx="8" fill="#0f172a" stroke="#1e293b"/>
      <text x="40" y="328" fill="#94a3b8" font-family="system-ui" font-size="12">Equilibrium: N = mg cos &#952; | Acceleration down incline: a = g(sin &#952; - &#956; cos &#952;)</text>
    </svg>`;
  }
  
  // 2. Projectile Motion
  if (p.includes("projectile") || p.includes("parabola") || p.includes("trajectory") || p.includes("flight")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 360" width="100%" height="100%">
      <defs>
        <linearGradient id="pbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#090d16"/><stop offset="100%" stop-color="#131d2e"/></linearGradient>
        <marker id="pCyan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#38bdf8"/></marker>
        <marker id="pAmber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#fbbf24"/></marker>
        <marker id="pGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#10b981"/></marker>
      </defs>
      <rect width="650" height="360" rx="14" fill="url(#pbg)" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="25" y="20" width="600" height="36" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="40" y="44" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Projectile Motion Trajectory &amp; Vectors</text>
      
      <!-- Ground & Axes -->
      <line x1="80" y1="280" x2="570" y2="280" stroke="#64748b" stroke-width="2.5"/>
      <line x1="100" y1="290" x2="100" y2="90" stroke="#64748b" stroke-width="2" marker-end="url(#pCyan)"/>
      <text x="110" y="105" fill="#94a3b8" font-family="system-ui" font-size="12">y (Height)</text>
      <text x="560" y="270" fill="#94a3b8" font-family="system-ui" font-size="12">x (Range)</text>
      
      <!-- Parabolic Trajectory -->
      <path d="M 100,280 Q 320,80 540,280" fill="none" stroke="#38bdf8" stroke-width="3.5"/>
      
      <!-- Launch vector u & components -->
      <line x1="100" y1="280" x2="180" y2="185" stroke="#fbbf24" stroke-width="3" marker-end="url(#pAmber)"/>
      <text x="145" y="180" fill="#fbbf24" font-family="system-ui" font-size="13" font-weight="bold">u</text>
      <line x1="100" y1="280" x2="180" y2="280" stroke="#10b981" stroke-width="2" stroke-dasharray="3,3"/>
      <text x="135" y="295" fill="#10b981" font-family="system-ui" font-size="11">u cos &#952;</text>
      <line x1="180" y1="280" x2="180" y2="185" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3,3"/>
      <text x="185" y="240" fill="#38bdf8" font-family="system-ui" font-size="11">u sin &#952;</text>
      <path d="M 130,280 A 30,30 0 0,0 125,255" fill="none" stroke="#fbbf24" stroke-width="2"/>
      <text x="135" y="268" fill="#fbbf24" font-family="system-ui" font-size="12">&#952;</text>
      
      <!-- Max Height H line -->
      <line x1="320" y1="180" x2="320" y2="280" stroke="#f43f5e" stroke-dasharray="4,4" stroke-width="2"/>
      <circle cx="320" cy="180" r="4" fill="#f43f5e"/>
      <text x="328" y="225" fill="#f43f5e" font-family="system-ui" font-size="12" font-weight="bold">H_max = u&#178; sin&#178;&#952; / 2g</text>
      
      <!-- Range R -->
      <line x1="100" y1="285" x2="540" y2="285" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="270" y="305" fill="#38bdf8" font-family="system-ui" font-size="13" font-weight="bold">Range R = u&#178; sin 2&#952; / g</text>
      
      <rect x="25" y="318" width="600" height="28" rx="6" fill="#0f172a"/>
      <text x="40" y="336" fill="#94a3b8" font-family="system-ui" font-size="11">Time of flight: T = 2u sin &#952; / g | Max range occurs at &#952; = 45&#176;</text>
    </svg>`;
  }

  // 3. Optics / Ray diagram
  if (p.includes("optics") || p.includes("lens") || p.includes("mirror") || p.includes("ray") || p.includes("focal")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 360" width="100%" height="100%">
      <defs>
        <linearGradient id="obg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#090d16"/><stop offset="100%" stop-color="#131d2e"/></linearGradient>
        <marker id="oArr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#38bdf8"/></marker>
        <marker id="oRed" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#f43f5e"/></marker>
      </defs>
      <rect width="650" height="360" rx="14" fill="url(#obg)" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="25" y="20" width="600" height="36" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="40" y="44" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Optics: Convex Lens Ray Diagram</text>
      
      <!-- Principal Axis -->
      <line x1="50" y1="200" x2="600" y2="200" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6,4"/>
      
      <!-- Convex Lens -->
      <path d="M 320,80 Q 340,200 320,320 Q 300,200 320,80" fill="#38bdf8" fill-opacity="0.15" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="320" cy="200" r="3" fill="#ffffff"/>
      <text x="325" y="218" fill="#94a3b8" font-family="system-ui" font-size="12">O</text>
      
      <!-- Foci points -->
      <circle cx="220" cy="200" r="3" fill="#fbbf24"/><text x="215" y="218" fill="#fbbf24" font-family="system-ui" font-size="12">F1</text>
      <circle cx="120" cy="200" r="3" fill="#fbbf24"/><text x="110" y="218" fill="#fbbf24" font-family="system-ui" font-size="12">2F1</text>
      <circle cx="420" cy="200" r="3" fill="#fbbf24"/><text x="415" y="218" fill="#fbbf24" font-family="system-ui" font-size="12">F2</text>
      <circle cx="520" cy="200" r="3" fill="#fbbf24"/><text x="515" y="218" fill="#fbbf24" font-family="system-ui" font-size="12">2F2</text>
      
      <!-- Object at 2F1 -->
      <line x1="160" y1="200" x2="160" y2="130" stroke="#10b981" stroke-width="3" marker-end="url(#oArr)"/>
      <text x="145" y="125" fill="#10b981" font-family="system-ui" font-size="13" font-weight="bold">Object</text>
      
      <!-- Ray 1: Parallel to axis, then through F2 -->
      <line x1="160" y1="130" x2="320" y2="130" stroke="#f43f5e" stroke-width="2" marker-end="url(#oRed)"/>
      <line x1="320" y1="130" x2="520" y2="290" stroke="#f43f5e" stroke-width="2"/>
      
      <!-- Ray 2: Through optical center O undeviated -->
      <line x1="160" y1="130" x2="320" y2="200" stroke="#38bdf8" stroke-width="2" marker-end="url(#oArr)"/>
      <line x1="320" y1="200" x2="520" y2="290" stroke="#38bdf8" stroke-width="2"/>
      
      <!-- Inverted Real Image -->
      <line x1="480" y1="200" x2="480" y2="260" stroke="#fbbf24" stroke-width="3" marker-end="url(#oArr)"/>
      <text x="490" y="260" fill="#fbbf24" font-family="system-ui" font-size="12" font-weight="bold">Real Inverted Image</text>
      
      <rect x="25" y="320" width="600" height="26" rx="6" fill="#0f172a"/>
      <text x="40" y="337" fill="#94a3b8" font-family="system-ui" font-size="11">Lens Formula: 1/f = 1/v - 1/u | Magnification: m = v/u = h_i / h_o</text>
    </svg>`;
  }

  // 4. Circuit / Electronics
  if (p.includes("circuit") || p.includes("wheatstone") || p.includes("resistor") || p.includes("current") || p.includes("voltage")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 360" width="100%" height="100%">
      <defs>
        <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#090d16"/><stop offset="100%" stop-color="#131d2e"/></linearGradient>
      </defs>
      <rect width="650" height="360" rx="14" fill="url(#cbg)" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="25" y="20" width="600" height="36" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="40" y="44" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Balanced Wheatstone Bridge Circuit</text>
      
      <!-- Bridge Diamond -->
      <!-- Node A (Left), B (Top), C (Right), D (Bottom) -->
      <line x1="160" y1="180" x2="320" y2="100" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="320" y1="100" x2="480" y2="180" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="160" y1="180" x2="320" y2="260" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="320" y1="260" x2="480" y2="180" stroke="#38bdf8" stroke-width="2.5"/>
      
      <!-- Galvanometer Bridge (B to D) -->
      <line x1="320" y1="100" x2="320" y2="260" stroke="#f43f5e" stroke-width="2"/>
      <circle cx="320" cy="180" r="18" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
      <text x="314" y="186" fill="#f43f5e" font-family="system-ui" font-size="15" font-weight="bold">G</text>
      <text x="345" y="185" fill="#f43f5e" font-family="system-ui" font-size="12">I_g = 0 (Balanced)</text>
      
      <!-- Resistor badges -->
      <rect x="215" y="125" width="40" height="22" rx="4" fill="#0f172a" stroke="#fbbf24"/>
      <text x="226" y="141" fill="#fbbf24" font-family="system-ui" font-size="13" font-weight="bold">P</text>
      
      <rect x="385" y="125" width="40" height="22" rx="4" fill="#0f172a" stroke="#fbbf24"/>
      <text x="395" y="141" fill="#fbbf24" font-family="system-ui" font-size="13" font-weight="bold">Q</text>
      
      <rect x="215" y="210" width="40" height="22" rx="4" fill="#0f172a" stroke="#10b981"/>
      <text x="226" y="226" fill="#10b981" font-family="system-ui" font-size="13" font-weight="bold">R</text>
      
      <rect x="385" y="210" width="40" height="22" rx="4" fill="#0f172a" stroke="#10b981"/>
      <text x="397" y="226" fill="#10b981" font-family="system-ui" font-size="13" font-weight="bold">S</text>
      
      <!-- External battery connections -->
      <line x1="160" y1="180" x2="100" y2="180" stroke="#64748b" stroke-width="2"/>
      <line x1="100" y1="180" x2="100" y2="310" stroke="#64748b" stroke-width="2"/>
      <line x1="100" y1="310" x2="540" y2="310" stroke="#64748b" stroke-width="2"/>
      <line x1="540" y1="310" x2="540" y2="180" stroke="#64748b" stroke-width="2"/>
      <line x1="540" y1="180" x2="480" y2="180" stroke="#64748b" stroke-width="2"/>
      
      <!-- Battery symbol at bottom -->
      <line x1="310" y1="300" x2="310" y2="320" stroke="#38bdf8" stroke-width="4"/>
      <line x1="325" y1="305" x2="325" y2="315" stroke="#64748b" stroke-width="2.5"/>
      <text x="335" y="325" fill="#38bdf8" font-family="system-ui" font-size="12">V_0 (Battery)</text>
      
      <!-- Balance formula -->
      <rect x="25" y="326" width="600" height="24" rx="4" fill="#0f172a"/>
      <text x="40" y="342" fill="#10b981" font-family="system-ui" font-size="12" font-weight="bold">Balance Condition: P / Q = R / S &#8660; Potential at B = Potential at D</text>
    </svg>`;
  }

  // 5. Central Force / Orbital Mechanics
  if (p.includes("orbit") || p.includes("central force") || p.includes("potential") || p.includes("kepler") || p.includes("gravity")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 360" width="100%" height="100%">
      <defs>
        <linearGradient id="orbBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#090d16"/><stop offset="100%" stop-color="#131d2e"/></linearGradient>
        <marker id="orbArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#38bdf8"/></marker>
        <marker id="orbRed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#f43f5e"/></marker>
      </defs>
      <rect width="650" height="360" rx="14" fill="url(#orbBg)" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="25" y="20" width="600" height="36" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="40" y="44" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Orbital Mechanics: Central Force &amp; Effective Potential</text>
      
      <!-- Axes -->
      <line x1="80" y1="280" x2="570" y2="280" stroke="#64748b" stroke-width="2"/>
      <line x1="100" y1="290" x2="100" y2="80" stroke="#64748b" stroke-width="2"/>
      <text x="110" y="95" fill="#94a3b8" font-family="system-ui" font-size="12">V_eff(r)</text>
      <text x="560" y="270" fill="#94a3b8" font-family="system-ui" font-size="12">r (radius)</text>
      
      <!-- Effective potential curve: V_eff = L^2/(2mr^2) - k/r -->
      <path d="M 120,90 Q 150,290 240,240 T 540,270" fill="none" stroke="#38bdf8" stroke-width="3.5"/>
      
      <!-- Minimum equilibrium point r0 -->
      <circle cx="215" cy="246" r="5" fill="#10b981"/>
      <line x1="215" y1="246" x2="215" y2="280" stroke="#10b981" stroke-dasharray="3,3" stroke-width="1.5"/>
      <text x="205" y="295" fill="#10b981" font-family="system-ui" font-size="12" font-weight="bold">r&#8320; (Stable Circular Orbit)</text>
      <text x="225" y="240" fill="#10b981" font-family="system-ui" font-size="11">dV_eff/dr = 0</text>
      
      <!-- Bound energy line E < 0 -->
      <line x1="135" y1="210" x2="420" y2="210" stroke="#fbbf24" stroke-dasharray="4,4" stroke-width="2"/>
      <text x="430" y="214" fill="#fbbf24" font-family="system-ui" font-size="12" font-weight="bold">Total Energy E &lt; 0 (Bound Ellipse)</text>
      
      <!-- Central Sun/Focus at top-right schematic -->
      <circle cx="500" cy="140" r="16" fill="#fbbf24" filter="drop-shadow(0 0 8px #fbbf24)"/>
      <ellipse cx="480" cy="140" rx="70" ry="35" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,3"/>
      <circle cx="420" cy="155" r="5" fill="#38bdf8"/>
      <line x1="420" y1="155" x2="485" y2="143" stroke="#f43f5e" stroke-width="2" marker-end="url(#orbRed)"/>
      <text x="435" y="135" fill="#f43f5e" font-family="system-ui" font-size="11">F_g = -k/r&#178;</text>
      
      <rect x="25" y="318" width="600" height="28" rx="6" fill="#0f172a"/>
      <text x="40" y="336" fill="#94a3b8" font-family="system-ui" font-size="11">V_eff(r) = L&#178;/(2mr&#178;) - k/r | Angular Momentum L = mvr = constant</text>
    </svg>`;
  }

  // 6. Calculus & Definite Integration
  if (p.includes("calculus") || p.includes("integral") || p.includes("area") || p.includes("sine") || p.includes("cosine") || p.includes("math")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 360" width="100%" height="100%">
      <defs>
        <linearGradient id="mbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#090d16"/><stop offset="100%" stop-color="#131d2e"/></linearGradient>
        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4"/><stop offset="100%" stop-color="#38bdf8" stop-opacity="0.05"/></linearGradient>
      </defs>
      <rect width="650" height="360" rx="14" fill="url(#mbg)" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="25" y="20" width="600" height="36" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="40" y="44" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Definite Integration &amp; Symmetry: King's Property</text>
      
      <!-- Axes -->
      <line x1="80" y1="260" x2="570" y2="260" stroke="#64748b" stroke-width="2"/>
      <line x1="120" y1="280" x2="120" y2="80" stroke="#64748b" stroke-width="2"/>
      <text x="130" y="95" fill="#94a3b8" font-family="system-ui" font-size="12">y</text>
      <text x="560" y="250" fill="#94a3b8" font-family="system-ui" font-size="12">x</text>
      
      <!-- Shaded Area Under Curve -->
      <path d="M 120,260 Q 240,110 360,185 Q 430,225 480,260 Z" fill="url(#areaGrad)"/>
      
      <!-- Curve f(x) -->
      <path d="M 120,260 Q 240,110 360,185 Q 430,225 480,260" fill="none" stroke="#38bdf8" stroke-width="3.5"/>
      <text x="210" y="125" fill="#38bdf8" font-family="system-ui" font-size="13" font-weight="bold">y = f(x)</text>
      
      <!-- Symmetric counterpart f(a+b-x) -->
      <path d="M 120,260 Q 170,225 240,185 Q 360,110 480,260" fill="none" stroke="#fbbf24" stroke-dasharray="4,4" stroke-width="2"/>
      <text x="380" y="125" fill="#fbbf24" font-family="system-ui" font-size="13" font-weight="bold">y = f(a+b-x)</text>
      
      <!-- Limits a and b -->
      <line x1="120" y1="260" x2="120" y2="270" stroke="#ffffff" stroke-width="2"/>
      <text x="115" y="285" fill="#ffffff" font-family="system-ui" font-size="12">a = 0</text>
      
      <line x1="480" y1="260" x2="480" y2="270" stroke="#ffffff" stroke-width="2"/>
      <text x="465" y="285" fill="#ffffff" font-family="system-ui" font-size="12">b = &#960;/2</text>
      
      <!-- Midpoint symmetry line at pi/4 -->
      <line x1="300" y1="130" x2="300" y2="260" stroke="#10b981" stroke-dasharray="3,3" stroke-width="2"/>
      <circle cx="300" cy="168" r="5" fill="#10b981"/>
      <text x="280" y="285" fill="#10b981" font-family="system-ui" font-size="12" font-weight="bold">x = &#960;/4</text>
      
      <rect x="25" y="318" width="600" height="28" rx="6" fill="#0f172a"/>
      <text x="40" y="336" fill="#94a3b8" font-family="system-ui" font-size="11">King's Rule: 2I = &#8747;[0 to &#960;/2] 1 dx = &#960;/2 &#8658; I = &#960;/4</text>
    </svg>`;
  }

  // 7. Organic Chemistry & Energy Profile
  if (p.includes("chemistry") || p.includes("reaction") || p.includes("elimination") || p.includes("zaitsev") || p.includes("activation") || p.includes("e2")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 360" width="100%" height="100%">
      <defs>
        <linearGradient id="chbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#090d16"/><stop offset="100%" stop-color="#131d2e"/></linearGradient>
        <marker id="chArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#38bdf8"/></marker>
      </defs>
      <rect width="650" height="360" rx="14" fill="url(#chbg)" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="25" y="20" width="600" height="36" rx="8" fill="#1e293b" stroke="#334155"/>
      <text x="40" y="44" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">Organic Chemistry: E2 Dehydrohalogenation Energy Profile</text>
      
      <!-- Axes -->
      <line x1="80" y1="280" x2="570" y2="280" stroke="#64748b" stroke-width="2"/>
      <line x1="100" y1="290" x2="100" y2="80" stroke="#64748b" stroke-width="2"/>
      <text x="110" y="95" fill="#94a3b8" font-family="system-ui" font-size="12">Potential Energy</text>
      <text x="500" y="270" fill="#94a3b8" font-family="system-ui" font-size="12">Reaction Coordinate</text>
      
      <!-- Reactants -->
      <line x1="100" y1="220" x2="160" y2="220" stroke="#fbbf24" stroke-width="3"/>
      <text x="110" y="205" fill="#fbbf24" font-family="system-ui" font-size="12" font-weight="bold">2-Bromobutane + OH&#8315;</text>
      
      <!-- Zaitsev Transition State Curve (Lower Ea) -->
      <path d="M 160,220 Q 280,70 380,245" fill="none" stroke="#10b981" stroke-width="3.5"/>
      <circle cx="270" cy="115" r="5" fill="#10b981"/>
      <text x="245" y="105" fill="#10b981" font-family="system-ui" font-size="12" font-weight="bold">TS&#8321;&#8225; (Zaitsev - Major)</text>
      
      <!-- Hofmann Transition State Curve (Higher Ea) -->
      <path d="M 160,220 Q 280,30 460,235" fill="none" stroke="#f43f5e" stroke-dasharray="4,4" stroke-width="2"/>
      <circle cx="275" cy="85" r="4" fill="#f43f5e"/>
      <text x="285" y="75" fill="#f43f5e" font-family="system-ui" font-size="11">TS&#8322;&#8225; (Hofmann - Minor)</text>
      
      <!-- Products -->
      <line x1="380" y1="245" x2="480" y2="245" stroke="#10b981" stroke-width="3"/>
      <text x="385" y="265" fill="#10b981" font-family="system-ui" font-size="12" font-weight="bold">trans-But-2-ene (Major Product)</text>
      
      <!-- Delta H Exothermic -->
      <line x1="500" y1="220" x2="500" y2="245" stroke="#38bdf8" stroke-width="2"/>
      <text x="510" y="235" fill="#38bdf8" font-family="system-ui" font-size="11">&#916;H &lt; 0</text>
      
      <rect x="25" y="318" width="600" height="28" rx="6" fill="#0f172a"/>
      <text x="40" y="336" fill="#94a3b8" font-family="system-ui" font-size="11">E2 Mechanism: Concerted, stereospecific anti-periplanar elimination</text>
    </svg>`;
  }
  return null;
};

// Create router for all API endpoints
const router = express.Router();

router.post("/auth/signup", (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });
  username = username.trim();
  if (memoryDb.users[username]) return res.status(400).json({ error: "Username already exists" });
  memoryDb.users[username] = { password, data: {} };
  saveDb(memoryDb);
  res.json({ success: true });
});

router.post("/auth/login", (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });
  username = username.trim();
  const user = memoryDb.users[username];
  if (!user || user.password !== password) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ success: true, data: user.data });
});

router.post("/data/sync/:username", (req, res) => {
  let { username } = req.params;
  username = username.trim();
  const { data } = req.body;
  if (memoryDb.users[username]) {
    memoryDb.users[username].data = { ...memoryDb.users[username].data, ...data };
    saveDb(memoryDb);
  }
  res.json({ success: true });
});

router.get("/data/:username", (req, res) => {
  let { username } = req.params;
  username = username.trim();
  const user = memoryDb.users[username];
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ success: true, data: user.data || {} });
});

router.post("/analyze-goals", async (req, res) => {
  try {
    const { goals } = req.body;
    const prompt = `Act as an expert mentor for JEE aspirants. The student has the following daily goals and completion status:\n\n${JSON.stringify(
      goals,
      null,
      2
    )}\n\nProvide a concise and effective analysis of their productivity. Keep it under 3-4 short bullet points or a couple of sentences. Format the response in standard Markdown.`;
    
    if (GROQ_API_KEY) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: prompt }]
        })
      });
      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid response from AI server: ${response.status} - ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) throw new Error(data.error?.message || "Failed");
      return res.json({ analysis: data.choices[0].message.content });
    } else if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const genResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      return res.json({ analysis: genResponse.text });
    } else {
      return res.status(400).json({ error: "GROQ_API_KEY is not configured in environment variables. Please add GROQ_API_KEY in your Vercel project settings." });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to analyze goals" });
  }
});

router.get("/diagram", async (req, res) => {
  try {
    const rawPrompt = (req.query.prompt as string) || "JEE physics scientific diagram";
    const cleanPrompt = decodeURIComponent(rawPrompt).trim();
    
    const cacheKey = cleanPrompt.toLowerCase();
    if (diagramCache.has(cacheKey)) {
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(diagramCache.get(cacheKey));
    }

    // Check precompiled fast templates first
    const precompiled = getPrecompiledDiagram(cleanPrompt);
    if (precompiled) {
      diagramCache.set(cacheKey, precompiled);
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(precompiled);
    }

    // Dynamically generate tailored SVG with Groq if key is available
    if (GROQ_API_KEY) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 4000)
        );
        const fetchPromise = fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              {
                role: "system",
                content: "You are an expert scientific SVG generator for JEE Physics, Chemistry, and Math. Generate a modern, highly detailed, beautifully labeled SVG diagram. You must return ONLY raw <svg>...</svg> code with viewBox=\"0 0 650 360\". Use dark futuristic styling: background #090d16, cyan (#38bdf8), rose (#f43f5e), amber (#fbbf24), emerald (#10b981) for vectors/labels. Include arrowheads in <defs>. Do not wrap in markdown or backticks."
              },
              { role: "user", content: `Generate an SVG diagram for: ${cleanPrompt}` }
            ]
          })
        });

        const groqRes: any = await Promise.race([fetchPromise, timeoutPromise]);
        if (groqRes.ok) {
          const groqData = await groqRes.json();
          let svgContent = groqData.choices?.[0]?.message?.content || "";
          
          const svgMatch = svgContent.match(/<svg[\s\S]*?<\/svg>/i);
          if (svgMatch) {
            svgContent = svgMatch[0];
            diagramCache.set(cacheKey, svgContent);
            res.setHeader("Content-Type", "image/svg+xml");
            res.setHeader("Cache-Control", "public, max-age=86400");
            return res.send(svgContent);
          }
        }
      } catch (err) {
        // Fallback gracefully
      }
    }

    // Fallback clean template
    const fallbackSvg = getPrecompiledDiagram("incline") || "";
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(fallbackSvg);
  } catch (e: any) {
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200"><rect width="600" height="200" fill="#090d16"/><text x="50" y="100" fill="#38bdf8" font-family="sans-serif" font-size="16">Scientific Diagram</text></svg>`);
  }
});

router.post("/solve-doubt", async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType } = req.body;
    
    const content = [];
    if (prompt) {
      content.push({ type: "text", text: prompt });
    }
    
    const systemPrompt = `You are a world-class AI Doubt Solver specifically designed for JEE Mains, JEE Advanced, WBJEE, CUET, and NEET aspirants.

CRITICAL FORMATTING RULES:
1. Your answers MUST be extremely crisp, step-by-step, and scientifically rigorous.
2. Break everything down into short bullet points and clear numbered steps.
3. Identify core concepts immediately in the very first sentence.
4. Use KaTeX / LaTeX formatting for math ($...$ for inline, $$...$$ for block math).

VISUAL DIAGRAMS RULE:
- If the user asks for a diagram, schematic, curve, or visual representation (or if a diagram clarifies the question):
  You MUST include a diagram link using standard markdown format pointing to the built-in diagram renderer:
  ![Diagram Description](/api/diagram?prompt=Short+URL+Encoded+Description)
  For example:
  ![Block on inclined plane](/api/diagram?prompt=Block+on+inclined+plane+with+forces)
  ![Projectile trajectory](/api/diagram?prompt=Projectile+motion+trajectory+vectors)
  ![Wheatstone bridge circuit](/api/diagram?prompt=Wheatstone+bridge+circuit)
- NEVER use external paid or broken image generation URLs (such as pollinations.ai).`;

    if (imageBase64 && mimeType) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const genResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt || "Analyze this image and solve any doubts it contains." },
                {
                  inlineData: {
                    data: imageBase64,
                    mimeType: mimeType
                  }
                }
              ]
            }
          ],
          config: {
            systemInstruction: systemPrompt
          }
        });
        
        return res.json({ solution: genResponse.text });
      } catch (geminiError) {
        console.error("Gemini Error:", geminiError);
        return res.status(500).json({ error: "Failed to process image using alternative vision model." });
      }
    }
    
    if (!prompt && content.length === 0) {
      return res.status(400).json({ error: "Please provide a prompt." });
    }

    if (GROQ_API_KEY) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ]
        })
      });

      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid response from AI server: ${response.status} - ${text.substring(0, 100)}`);
      }

      if (!response.ok) throw new Error(data.error?.message || "Failed");
      return res.json({ solution: data.choices[0].message.content });
    } else if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const genResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: systemPrompt
        }
      });
      return res.json({ solution: genResponse.text });
    } else {
      return res.status(400).json({ error: "GROQ_API_KEY is not configured in environment variables. Please add GROQ_API_KEY in your Vercel project settings." });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to solve doubt" });
  }
});

router.post("/feedback", async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    console.log(`[Feedback Received] Rating: ${rating} | Feedback: ${feedback}`);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

// Mount router on BOTH "/api" AND "/" to handle any Vercel rewrite variation
app.use("/api", router);
app.use("/", router);

export default app;
