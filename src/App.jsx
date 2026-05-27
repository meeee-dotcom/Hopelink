/**
 * HopeLink — NGO Connector Platform
 * Production-ready React SPA
 * 
 * Architecture:
 * - Single-file React app with modular component sections
 * - Simulated backend via AI (Anthropic API) for dynamic NGO data & recommendations
 * - LocalStorage for persistence (simulating DB)
 * - Role-based: Volunteer | NGO Admin | Donor
 * - Reward point system, donation flow, beneficiary reporting
 * - Dark/Light mode, search, location-based filtering, push-style notifications
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS & CONFIG ──────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "orphanage", label: "Orphanages", icon: "🏠", color: "#FF6B6B" },
  { id: "old_age", label: "Old Age Homes", icon: "🌸", color: "#4ECDC4" },
  { id: "food_drive", label: "Food Drives", icon: "🍱", color: "#FFE66D" },
  { id: "shelter", label: "Shelters", icon: "⛺", color: "#A8E6CF" },
  { id: "education", label: "Education", icon: "📚", color: "#DDA0DD" },
  { id: "medical", label: "Medical Aid", icon: "🏥", color: "#87CEEB" },
];

const MOCK_NGOS = [
  {
    id: "ngo_001", name: "Sunshine Children's Home", category: "orphanage",
    description: "Providing safe shelter, education, and love to abandoned children since 1998.",
    address: "12 Hope Street, Mumbai, Maharashtra 400001",
    phone: "+91 98765 43210", email: "contact@sunshinehome.org",
    website: "www.sunshinehome.org", lat: 19.076, lng: 72.877,
    distanceKm: 1.2, rating: 4.8, reviewCount: 234,
    helped: 1847, capacity: 120, currentOccupancy: 87,
    founded: 1998, verified: true,
    needs: ["Clothes", "Books", "Volunteers", "Food"],
    photos: ["🏡", "👶", "📖"],
    story: "Started by social worker Anita Desai with just 3 children, Sunshine now cares for over 80 kids.",
    donationGoal: 500000, donationRaised: 312000,
  },
  {
    id: "ngo_002", name: "Silver Years Old Age Home", category: "old_age",
    description: "Dignified care for senior citizens with medical support and community activities.",
    address: "45 Serenity Lane, Pune, Maharashtra 411001",
    phone: "+91 87654 32109", email: "care@silveryears.org",
    website: "www.silveryears.org", lat: 18.52, lng: 73.856,
    distanceKm: 2.8, rating: 4.6, reviewCount: 189,
    helped: 923, capacity: 80, currentOccupancy: 65,
    founded: 2003, verified: true,
    needs: ["Medical Supplies", "Warm Clothes", "Volunteers", "Entertainment"],
    photos: ["🏥", "🌿", "🎵"],
    story: "Founded by Dr. Ramesh Nair, Silver Years provides medical care and companionship to seniors.",
    donationGoal: 300000, donationRaised: 198000,
  },
  {
    id: "ngo_003", name: "Annapurna Food Drive", category: "food_drive",
    description: "Zero hunger initiative distributing hot meals to 500+ people daily across the city.",
    address: "Community Center, Dharavi, Mumbai 400017",
    phone: "+91 76543 21098", email: "feed@annapurna.org",
    website: "www.annapurna.org", lat: 19.042, lng: 72.857,
    distanceKm: 0.7, rating: 4.9, reviewCount: 512,
    helped: 45230, capacity: 600, currentOccupancy: 520,
    founded: 2010, verified: true,
    needs: ["Raw Materials", "Volunteers", "Vehicles", "Utensils"],
    photos: ["🍛", "👨‍🍳", "🚐"],
    story: "Chef Meera Patel turned her restaurant into a full-time food operation feeding thousands daily.",
    donationGoal: 200000, donationRaised: 175000,
  },
  {
    id: "ngo_004", name: "Aashray Shelter Home", category: "shelter",
    description: "Emergency shelter for homeless individuals with rehabilitation and skill training.",
    address: "78 Refuge Road, Delhi 110001",
    phone: "+91 65432 10987", email: "help@aashray.org",
    website: "www.aashray.org", lat: 28.704, lng: 77.102,
    distanceKm: 3.4, rating: 4.5, reviewCount: 167,
    helped: 3421, capacity: 200, currentOccupancy: 178,
    founded: 2005, verified: true,
    needs: ["Bedding", "Hygiene Kits", "Skill Trainers", "Laptops"],
    photos: ["🛏️", "🧼", "💼"],
    story: "Aashray has rehabilitated over 3,000 homeless individuals, with 60% finding sustainable employment.",
    donationGoal: 400000, donationRaised: 256000,
  },
  {
    id: "ngo_005", name: "Vidya Deep Education Trust", category: "education",
    description: "Free quality education for underprivileged children from Class 1 to 10.",
    address: "32 Knowledge Park, Bangalore 560001",
    phone: "+91 54321 09876", email: "learn@vidyadeep.org",
    website: "www.vidyadeep.org", lat: 12.971, lng: 77.594,
    distanceKm: 1.9, rating: 4.7, reviewCount: 298,
    helped: 7892, capacity: 500, currentOccupancy: 487,
    founded: 2000, verified: true,
    needs: ["Books", "Computers", "Teachers", "Stationery"],
    photos: ["📚", "💻", "🎓"],
    story: "Founded by IIT alumni, Vidya Deep has produced 500+ college graduates from slum communities.",
    donationGoal: 600000, donationRaised: 445000,
  },
  {
    id: "ngo_006", name: "Jeevan Medical Relief", category: "medical",
    description: "Free medical camps and healthcare for tribal and rural communities.",
    address: "Medical Campus, Nagpur, Maharashtra 440001",
    phone: "+91 43210 98765", email: "health@jeevan.org",
    website: "www.jeevan.org", lat: 21.145, lng: 79.088,
    distanceKm: 5.1, rating: 4.8, reviewCount: 341,
    helped: 28943, capacity: 300, currentOccupancy: 210,
    founded: 1995, verified: true,
    needs: ["Medicines", "Medical Equipment", "Doctors", "Ambulances"],
    photos: ["💊", "🩺", "🏥"],
    story: "Dr. Kavita Singh's mobile medical unit has conducted 12,000+ free surgeries in 28 years.",
    donationGoal: 800000, donationRaised: 623000,
  },
];

const REWARD_ACTIONS = {
  REPORT_BENEFICIARY: { points: 50, label: "Reported a beneficiary" },
  CONNECT_SUCCESS: { points: 200, label: "Successfully connected beneficiary to NGO" },
  DONATION_MADE: { points: 25, label: "Made a donation" },
  VOLUNTEER: { points: 100, label: "Volunteered at NGO" },
  REFERRAL: { points: 75, label: "Referred a friend" },
  SHARE: { points: 10, label: "Shared NGO profile" },
};

const REWARD_LEVELS = [
  { name: "Seed", min: 0, icon: "🌱", color: "#95D5B2" },
  { name: "Sprout", min: 200, icon: "🌿", color: "#52B788" },
  { name: "Guardian", min: 500, icon: "🌳", color: "#40916C" },
  { name: "Champion", min: 1000, icon: "⭐", color: "#F4A261" },
  { name: "Hero", min: 2000, icon: "🏆", color: "#E76F51" },
  { name: "Legend", min: 5000, icon: "👑", color: "#9B2226" },
];

// ─── UTILITIES ───────────────────────────────────────────────────────────────

const getFromStorage = (key, fallback = null) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const setToStorage = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const getRewardLevel = (points) =>
  [...REWARD_LEVELS].reverse().find(l => points >= l.min) || REWARD_LEVELS[0];

const formatDistance = (km) =>
  km < 1 ? `${Math.round(km * 1000)}m away` : `${km.toFixed(1)}km away`;

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── AI HELPER ───────────────────────────────────────────────────────────────

const callClaude = async (prompt, systemPrompt) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt || "You are a helpful assistant for a humanitarian NGO connector app. Be compassionate, concise, and actionable.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
};

// ─── STYLES ──────────────────────────────────────────────────────────────────

const injectStyles = () => {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #FDF6EE;
      --bg2: #F5EBE0;
      --bg3: #EDE0D4;
      --surface: #FFFFFF;
      --surface2: #FAF3EC;
      --border: #E8D5C4;
      --text: #2C1A0E;
      --text2: #6B4C3B;
      --text3: #9B7B6A;
      --accent: #C1440E;
      --accent2: #E8722A;
      --accent-light: #FFEEE6;
      --green: #2D6A4F;
      --green-light: #D8F3DC;
      --blue: #1A5276;
      --blue-light: #D6EAF8;
      --gold: #B7860B;
      --gold-light: #FEF9E7;
      --shadow: 0 2px 12px rgba(44,26,14,0.08);
      --shadow-md: 0 8px 32px rgba(44,26,14,0.12);
      --shadow-lg: 0 24px 64px rgba(44,26,14,0.16);
      --radius: 16px;
      --radius-sm: 8px;
      --radius-lg: 24px;
      --font-display: 'Fraunces', Georgia, serif;
      --font-body: 'DM Sans', system-ui, sans-serif;
      --transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
    }

    [data-theme="dark"] {
      --bg: #1A0F08;
      --bg2: #231409;
      --bg3: #2E1A0D;
      --surface: #2A1810;
      --surface2: #321E13;
      --border: #4A2E1E;
      --text: #F5E6D3;
      --text2: #C4A882;
      --text3: #8A6E58;
      --accent: #E8722A;
      --accent2: #F4A261;
      --accent-light: #3D1E0A;
      --green: #52B788;
      --green-light: #0D2B1A;
      --blue: #5DA0C5;
      --blue-light: #0A2030;
      --gold: #F4D03F;
      --gold-light: #2D2000;
      --shadow: 0 2px 12px rgba(0,0,0,0.3);
      --shadow-md: 0 8px 32px rgba(0,0,0,0.4);
      --shadow-lg: 0 24px 64px rgba(0,0,0,0.5);
    }

    html { font-size: 16px; scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.6;
      min-height: 100vh;
      overflow-x: hidden;
    }

    #root { min-height: 100vh; display: flex; flex-direction: column; }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg2); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

    /* ── Typography ── */
    h1,h2,h3 { font-family: var(--font-display); font-weight: 600; line-height: 1.2; }
    h4,h5,h6 { font-family: var(--font-body); font-weight: 600; }

    /* ── Layout ── */
    .app-shell { display: flex; flex-direction: column; min-height: 100vh; }
    .main-content { flex: 1; padding-bottom: 80px; }
    .container { max-width: 480px; margin: 0 auto; padding: 0 16px; }
    .container-wide { max-width: 900px; margin: 0 auto; padding: 0 16px; }

    /* ── Header ── */
    .header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky; top: 0; z-index: 100;
      padding: 12px 16px;
    }
    .header-inner {
      max-width: 480px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
    }
    .logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
    .logo-mark {
      width: 36px; height: 36px;
      background: var(--accent);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }
    .logo-text {
      font-family: var(--font-display);
      font-size: 20px; font-weight: 700;
      color: var(--text);
    }
    .logo-text span { color: var(--accent); }

    /* ── Bottom Nav ── */
    .bottom-nav {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
      background: var(--surface);
      border-top: 1px solid var(--border);
      display: flex;
      box-shadow: 0 -4px 24px rgba(44,26,14,0.08);
    }
    .nav-item {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 10px 4px; gap: 3px;
      cursor: pointer; border: none; background: none;
      color: var(--text3); transition: var(--transition);
      font-family: var(--font-body);
    }
    .nav-item.active { color: var(--accent); }
    .nav-item:hover { color: var(--accent2); }
    .nav-icon { font-size: 22px; line-height: 1; }
    .nav-label { font-size: 10px; font-weight: 500; letter-spacing: 0.3px; }

    /* ── Buttons ── */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px 24px; border-radius: var(--radius);
      font-family: var(--font-body); font-size: 15px; font-weight: 500;
      cursor: pointer; border: none; transition: var(--transition);
      text-decoration: none; white-space: nowrap;
    }
    .btn-primary {
      background: var(--accent); color: white;
    }
    .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: var(--shadow-md); }
    .btn-secondary {
      background: var(--surface2); color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover { background: var(--bg3); }
    .btn-ghost { background: none; color: var(--text2); border: 1px solid var(--border); }
    .btn-ghost:hover { background: var(--surface2); }
    .btn-green { background: var(--green); color: white; }
    .btn-green:hover { filter: brightness(1.1); }
    .btn-sm { padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm); }
    .btn-lg { padding: 16px 32px; font-size: 17px; }
    .btn-full { width: 100%; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

    /* ── Cards ── */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }
    .card-body { padding: 16px; }
    .card-hover { transition: var(--transition); cursor: pointer; }
    .card-hover:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--accent); }

    /* ── NGO Card ── */
    .ngo-card { position: relative; }
    .ngo-card-header {
      background: linear-gradient(135deg, var(--accent-light), var(--bg2));
      padding: 20px; display: flex; gap: 14px; align-items: flex-start;
    }
    .ngo-emoji { font-size: 40px; line-height: 1; }
    .ngo-badge {
      position: absolute; top: 12px; right: 12px;
      background: var(--green); color: white;
      font-size: 11px; font-weight: 600;
      padding: 3px 8px; border-radius: 20px;
      display: flex; align-items: center; gap: 4px;
    }
    .ngo-name { font-family: var(--font-display); font-size: 17px; font-weight: 600; color: var(--text); }
    .ngo-category {
      font-size: 12px; color: var(--accent); font-weight: 500;
      background: var(--accent-light); padding: 3px 8px;
      border-radius: 20px; display: inline-block; margin-top: 4px;
    }
    .ngo-distance { font-size: 13px; color: var(--text3); margin-top: 4px; display: flex; align-items: center; gap: 4px; }
    .ngo-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px; background: var(--border); border-top: 1px solid var(--border); }
    .ngo-stat { background: var(--surface2); padding: 12px; text-align: center; }
    .ngo-stat-val { font-weight: 700; font-size: 18px; color: var(--accent); font-family: var(--font-display); }
    .ngo-stat-label { font-size: 11px; color: var(--text3); margin-top: 2px; }
    .ngo-needs { display: flex; flex-wrap: wrap; gap: 6px; padding: 12px 16px; border-top: 1px solid var(--border); }
    .need-tag {
      background: var(--bg2); border: 1px solid var(--border);
      font-size: 12px; padding: 3px 10px; border-radius: 20px;
      color: var(--text2);
    }

    /* ── Forms ── */
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--text2); margin-bottom: 6px; }
    .form-input {
      width: 100%; padding: 12px 16px;
      background: var(--surface2); border: 1.5px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text);
      font-family: var(--font-body); font-size: 15px;
      transition: var(--transition); outline: none;
    }
    .form-input:focus { border-color: var(--accent); background: var(--surface); }
    .form-input::placeholder { color: var(--text3); }
    .form-input.error { border-color: #E74C3C; }
    .form-error { font-size: 12px; color: #E74C3C; margin-top: 4px; }
    .form-textarea { resize: vertical; min-height: 100px; }

    /* ── Search ── */
    .search-bar {
      display: flex; align-items: center; gap: 10px;
      background: var(--surface); border: 1.5px solid var(--border);
      border-radius: var(--radius); padding: 12px 16px;
      transition: var(--transition);
    }
    .search-bar:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(193,68,14,0.1); }
    .search-bar input { flex: 1; border: none; background: none; outline: none;
      font-family: var(--font-body); font-size: 15px; color: var(--text); }
    .search-bar input::placeholder { color: var(--text3); }
    .search-icon { color: var(--text3); font-size: 18px; }

    /* ── Switch (settings) ── */
    .switch { position: relative; width: 44px; height: 24px; cursor: pointer; flex-shrink: 0; display: inline-block; }
    .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
    .switch-track { position: absolute; inset: 0; background: var(--bg3); border-radius: 24px; transition: var(--transition); }
    .switch-thumb { position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: white; border-radius: 50%; transition: var(--transition); box-shadow: 0 1px 3px rgba(0,0,0,0.2); pointer-events: none; }
    .switch input:checked ~ .switch-track { background: var(--accent); }
    .switch input:checked ~ .switch-thumb { transform: translateX(20px); }

    /* ── Category Pills ── */
    .category-pills { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
    .category-pills::-webkit-scrollbar { display: none; }
    .category-pill {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 40px;
      border: 1.5px solid var(--border); background: var(--surface);
      cursor: pointer; transition: var(--transition);
      white-space: nowrap; font-size: 13px; font-weight: 500;
      color: var(--text2); font-family: var(--font-body);
    }
    .category-pill.active {
      background: var(--accent); border-color: var(--accent);
      color: white; box-shadow: 0 4px 12px rgba(193,68,14,0.3);
    }
    .category-pill:hover:not(.active) { border-color: var(--accent2); color: var(--accent2); }

    /* ── Progress Bar ── */
    .progress-bar { background: var(--bg3); border-radius: 20px; height: 8px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 20px; transition: width 1s ease; }
    .progress-fill.green { background: linear-gradient(90deg, var(--green), #52B788); }
    .progress-fill.accent { background: linear-gradient(90deg, var(--accent), var(--accent2)); }

    /* ── Rating Stars ── */
    .stars { color: #F4D03F; font-size: 14px; }

    /* ── Notifications ── */
    .toast-container {
      position: fixed; top: 16px; right: 16px; z-index: 9999;
      display: flex; flex-direction: column; gap: 8px;
      max-width: 320px;
    }
    .toast {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 14px 16px;
      box-shadow: var(--shadow-md);
      display: flex; align-items: flex-start; gap: 10px;
      animation: slideIn 0.3s ease;
    }
    .toast.success { border-left: 4px solid var(--green); }
    .toast.error { border-left: 4px solid #E74C3C; }
    .toast.info { border-left: 4px solid var(--blue); }
    .toast.reward { border-left: 4px solid var(--gold); }
    .toast-title { font-weight: 600; font-size: 14px; }
    .toast-msg { font-size: 13px; color: var(--text2); margin-top: 2px; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    /* ── Avatar ── */
    .avatar {
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-weight: 700;
      background: var(--accent-light); color: var(--accent);
      font-family: var(--font-display); flex-shrink: 0;
    }

    /* ── Reward Badge ── */
    .reward-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 40px;
      font-size: 13px; font-weight: 600;
      background: var(--gold-light); color: var(--gold);
      border: 1.5px solid var(--gold);
    }
    .points-big { font-family: var(--font-display); font-size: 48px; font-weight: 700; color: var(--accent); }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(44,26,14,0.5); backdrop-filter: blur(4px);
      display: flex; align-items: flex-end; justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-sheet {
      background: var(--surface);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      width: 100%; max-width: 480px;
      max-height: 90vh; overflow-y: auto;
      animation: slideUp 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .modal-handle {
      width: 40px; height: 4px; background: var(--border);
      border-radius: 2px; margin: 12px auto 0;
    }
    .modal-header { padding: 16px 20px; border-bottom: 1px solid var(--border); }
    .modal-body { padding: 20px; }
    .modal-footer { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; gap: 10px; }

    /* ── Section ── */
    .section { padding: 20px 0 8px; }
    .section-title {
      font-family: var(--font-display); font-size: 20px; font-weight: 600;
      color: var(--text); margin-bottom: 4px;
    }
    .section-sub { font-size: 13px; color: var(--text3); }

    /* ── Chip / Tag ── */
    .chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 20px;
      font-size: 12px; font-weight: 500;
    }
    .chip-green { background: var(--green-light); color: var(--green); }
    .chip-blue { background: var(--blue-light); color: var(--blue); }
    .chip-gold { background: var(--gold-light); color: var(--gold); }
    .chip-accent { background: var(--accent-light); color: var(--accent); }

    /* ── Divider ── */
    .divider { height: 1px; background: var(--border); margin: 16px 0; }

    /* ── Loading ── */
    .skeleton {
      background: linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-sm);
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .spinner {
      width: 32px; height: 32px;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Donation ── */
    .donation-amounts { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
    .donation-amount-btn {
      padding: 12px; border-radius: var(--radius-sm);
      border: 1.5px solid var(--border); background: var(--surface2);
      cursor: pointer; text-align: center; transition: var(--transition);
      font-family: var(--font-body); font-size: 15px; font-weight: 600;
      color: var(--text2);
    }
    .donation-amount-btn.active {
      border-color: var(--accent); background: var(--accent-light);
      color: var(--accent);
    }

    /* ── Map Pin Pulse ── */
    .pulse {
      width: 12px; height: 12px; background: var(--accent);
      border-radius: 50%; display: inline-block;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(193,68,14,0.4); }
      50% { box-shadow: 0 0 0 8px rgba(193,68,14,0); }
    }

    /* ── Hero Section ── */
    .hero {
      padding: 32px 16px 24px;
      background: linear-gradient(160deg, var(--bg2) 0%, var(--bg) 100%);
      border-bottom: 1px solid var(--border);
      text-align: center;
    }
    .hero-title { font-size: 28px; line-height: 1.2; margin-bottom: 8px; }
    .hero-title em { font-style: italic; color: var(--accent); }
    .hero-subtitle { color: var(--text2); font-size: 15px; }

    /* ── Impact Counter ── */
    .impact-counter {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      text-align: center;
    }
    .impact-num { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--accent); }
    .impact-label { font-size: 11px; color: var(--text3); margin-top: 2px; }

    /* ── Report Form ── */
    .report-category-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .report-category-card {
      padding: 16px; border-radius: var(--radius);
      border: 2px solid var(--border); background: var(--surface2);
      cursor: pointer; text-align: center; transition: var(--transition);
    }
    .report-category-card.selected { border-color: var(--accent); background: var(--accent-light); }
    .report-category-card:hover:not(.selected) { border-color: var(--accent2); }
    .report-category-emoji { font-size: 28px; margin-bottom: 8px; }
    .report-category-label { font-size: 13px; font-weight: 600; color: var(--text2); }

    /* ── Activity Feed ── */
    .activity-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
    .activity-item:last-child { border-bottom: none; }
    .activity-icon { width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; font-size: 18px;
      background: var(--bg2); flex-shrink: 0; }
    .activity-content { flex: 1; }
    .activity-title { font-size: 14px; font-weight: 500; color: var(--text); }
    .activity-meta { font-size: 12px; color: var(--text3); margin-top: 2px; }
    .activity-points { font-weight: 700; color: var(--green); font-size: 14px; }

    /* ── Tabs ── */
    .tabs { display: flex; gap: 4px; background: var(--bg2); border-radius: var(--radius); padding: 4px; }
    .tab-btn {
      flex: 1; padding: 8px; border-radius: var(--radius-sm);
      border: none; background: none; cursor: pointer;
      font-family: var(--font-body); font-size: 14px; font-weight: 500;
      color: var(--text3); transition: var(--transition);
    }
    .tab-btn.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow); }

    /* ── Profile ── */
    .profile-header {
      text-align: center; padding: 32px 16px 24px;
      background: linear-gradient(160deg, var(--accent-light) 0%, var(--bg) 100%);
    }
    .profile-avatar {
      width: 80px; height: 80px; font-size: 32px;
      margin: 0 auto 12px;
      border: 3px solid var(--surface);
      box-shadow: var(--shadow-md);
    }
    .profile-name { font-family: var(--font-display); font-size: 22px; font-weight: 600; }
    .profile-role { font-size: 13px; color: var(--text3); margin-top: 4px; }

    /* ── Login Screen ── */
    .login-screen {
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: var(--bg);
      padding: 32px 24px;
    }
    .login-illustration {
      font-size: 64px; margin-bottom: 24px;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .login-tagline {
      font-family: var(--font-display);
      font-size: 28px; font-weight: 600;
      text-align: center; line-height: 1.3;
      margin-bottom: 8px;
    }
    .login-tagline em { font-style: italic; color: var(--accent); }
    .login-sub { text-align: center; color: var(--text2); font-size: 15px; margin-bottom: 32px; }
    .login-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 24px;
      width: 100%; max-width: 360px;
      box-shadow: var(--shadow-md);
    }

    /* ── Responsive ── */
    @media (min-width: 600px) {
      .container { padding: 0 24px; }
      .hero-title { font-size: 36px; }
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
};

// ─── TOAST SYSTEM ─────────────────────────────────────────────────────────────

let _toastSetter = null;
const toast = {
  show: (type, title, msg) => _toastSetter?.(prev => [...prev, { id: Date.now(), type, title, msg }]),
  success: (title, msg) => toast.show("success", title, msg),
  error: (title, msg) => toast.show("error", title, msg),
  info: (title, msg) => toast.show("info", title, msg),
  reward: (title, msg) => toast.show("reward", title, msg),
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  _toastSetter = setToasts;
  useEffect(() => {
    if (toasts.length === 0) return;
    const t = setTimeout(() => setToasts(p => p.slice(1)), 4000);
    return () => clearTimeout(t);
  }, [toasts]);
  const icons = { success: "✅", error: "❌", info: "ℹ️", reward: "⭐" };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span style={{ fontSize: 20 }}>{icons[t.type]}</span>
          <div>
            <div className="toast-title">{t.title}</div>
            {t.msg && <div className="toast-msg">{t.msg}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────

const useAuth = () => {
  const [user, setUser] = useState(() => getFromStorage("hl_user"));
  const login = (userData) => { setToStorage("hl_user", userData); setUser(userData); };
  const logout = () => { localStorage.removeItem("hl_user"); setUser(null); };
  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setToStorage("hl_user", updated);
    setUser(updated);
  };
  return { user, login, logout, updateUser };
};

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────

const LoginScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login"); // login | signup
  const [role, setRole] = useState("volunteer");
  const [form, setForm] = useState({ name: "", email: "", password: "", org: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (mode === "signup" && !form.name.trim()) errs.name = "Name required";
    if (!form.email.includes("@")) errs.email = "Valid email required";
    if (form.password.length < 6) errs.password = "Min 6 characters";
    if (mode === "signup" && role === "ngo" && !form.org.trim()) errs.org = "Organization name required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simulate API
    const userData = {
      id: `user_${Date.now()}`,
      name: form.name || form.email.split("@")[0],
      email: form.email,
      role,
      org: form.org,
      points: mode === "signup" ? 0 : (getFromStorage("hl_user")?.points || 0),
      avatar: form.name?.[0]?.toUpperCase() || "U",
      joinedAt: new Date().toISOString(),
      helpCount: 0,
      donationTotal: 0,
      activity: [],
    };
    setLoading(false);
    onLogin(userData);
    toast.success("Welcome to HopeLink!", `Signed in as ${userData.name}`);
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="login-screen">
      <div className="login-illustration">🤝</div>
      <h1 className="login-tagline">Connecting <em>hearts</em> to those in need</h1>
      <p className="login-sub">Join thousands making a real difference</p>

      <div className="login-card">
        <div className="tabs" style={{ marginBottom: 20 }}>
          <button className={`tab-btn ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Sign In</button>
          <button className={`tab-btn ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>Sign Up</button>
        </div>

        {mode === "signup" && (
          <>
            <div className="form-group">
              <label className="form-label">I want to join as</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[{ v: "volunteer", icon: "🙋", l: "Volunteer" }, { v: "ngo", icon: "🏛️", l: "NGO" }, { v: "donor", icon: "💝", l: "Donor" }].map(r => (
                  <button key={r.v} onClick={() => setRole(r.v)}
                    style={{
                      padding: "10px 4px", borderRadius: 10, border: `2px solid ${role === r.v ? "var(--accent)" : "var(--border)"}`,
                      background: role === r.v ? "var(--accent-light)" : "var(--surface2)",
                      cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                      fontFamily: "var(--font-body)",
                    }}>
                    <div style={{ fontSize: 22 }}>{r.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: role === r.v ? "var(--accent)" : "var(--text2)", marginTop: 4 }}>{r.l}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className={`form-input ${errors.name ? "error" : ""}`} placeholder="Priya Sharma" value={form.name} onChange={f("name")} />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            {role === "ngo" && (
              <div className="form-group">
                <label className="form-label">Organization Name</label>
                <input className={`form-input ${errors.org ? "error" : ""}`} placeholder="Hope Foundation" value={form.org} onChange={f("org")} />
                {errors.org && <div className="form-error">{errors.org}</div>}
              </div>
            )}
          </>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className={`form-input ${errors.email ? "error" : ""}`} type="email" placeholder="you@email.com" value={form.email} onChange={f("email")} />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className={`form-input ${errors.password ? "error" : ""}`} type="password" placeholder="••••••••" value={form.password} onChange={f("password")} />
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>

        <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={loading}>
          {loading ? <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Processing...</> : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--text3)" }}>
          By continuing you agree to our Terms & Privacy Policy
        </div>
      </div>

      {/* Demo hint */}
      <div style={{ marginTop: 16, padding: "10px 16px", background: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--gold)", maxWidth: 360, width: "100%", textAlign: "center" }}>
        💡 Demo: enter any email & password (6+ chars)
      </div>
    </div>
  );
};

// ─── NGO DETAIL MODAL ─────────────────────────────────────────────────────────

const NGODetailModal = ({ ngo, user, onClose, onAddPoints }) => {
  const [tab, setTab] = useState("about");
  const [donationAmt, setDonationAmt] = useState(500);
  const [customAmt, setCustomAmt] = useState("");
  const [donating, setDonating] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [loadingTip, setLoadingTip] = useState(false);

  useEffect(() => {
    const fetchTip = async () => {
      setLoadingTip(true);
      try {
        const tip = await callClaude(
          `Give one specific, actionable tip (2 sentences max) for someone who wants to help "${ngo.name}" (a ${ngo.category} NGO). Be warm and specific.`,
          "You are a compassionate NGO advisor. Be concise, specific, and inspiring."
        );
        setAiTip(tip);
      } catch { setAiTip("Reach out directly — your time and care make the biggest difference."); }
      setLoadingTip(false);
    };
    fetchTip();
  }, [ngo]);

  const handleDonate = async () => {
    const amount = customAmt ? parseInt(customAmt) : donationAmt;
    if (!amount || amount < 100) { toast.error("Minimum donation is ₹100"); return; }
    setDonating(true);
    await new Promise(r => setTimeout(r, 1500));
    setDonating(false);
    onAddPoints(REWARD_ACTIONS.DONATION_MADE.points, `Donated ${formatCurrency(amount)} to ${ngo.name}`);
    toast.success("Donation Successful! 💝", `${formatCurrency(amount)} sent to ${ngo.name}`);
    onClose();
  };

  const handleContact = () => {
    toast.info("Opening contact", `Calling ${ngo.phone}`);
    onAddPoints(REWARD_ACTIONS.REPORT_BENEFICIARY.points, `Contacted ${ngo.name}`);
  };

  const pct = Math.round((ngo.donationRaised / ngo.donationGoal) * 100);
  const occupancyPct = Math.round((ngo.currentOccupancy / ngo.capacity) * 100);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        {/* Hero */}
        <div style={{
          background: `linear-gradient(135deg, var(--accent-light), var(--bg2))`,
          padding: "20px 20px 16px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{ngo.photos[0]}</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{ngo.name}</h2>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span className="chip chip-accent">{CATEGORIES.find(c => c.id === ngo.category)?.label}</span>
                {ngo.verified && <span className="chip chip-green">✓ Verified</span>}
                <span style={{ fontSize: 13, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="pulse" /> {formatDistance(ngo.distanceKm)}
                </span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 8 }}>
            <span className="stars">{"★".repeat(Math.round(ngo.rating))}</span>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>{ngo.rating} ({ngo.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <div className="tabs">
            {["about", "donate", "contact"].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t === "about" ? "📋 About" : t === "donate" ? "💝 Donate" : "📞 Contact"}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body">
          {tab === "about" && (
            <>
              {/* Stats */}
              <div className="ngo-stats" style={{ borderRadius: "var(--radius)", overflow: "hidden", marginBottom: 16 }}>
                <div className="ngo-stat"><div className="ngo-stat-val">{ngo.helped.toLocaleString()}</div><div className="ngo-stat-label">People Helped</div></div>
                <div className="ngo-stat"><div className="ngo-stat-val">{ngo.capacity}</div><div className="ngo-stat-label">Capacity</div></div>
                <div className="ngo-stat"><div className="ngo-stat-val">{ngo.founded}</div><div className="ngo-stat-label">Founded</div></div>
              </div>

              <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{ngo.description}</p>

              {/* Occupancy */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Current Occupancy</span>
                  <span style={{ fontSize: 13, color: "var(--text3)" }}>{ngo.currentOccupancy}/{ngo.capacity}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill accent" style={{ width: `${occupancyPct}%` }} />
                </div>
              </div>

              {/* Story */}
              <div style={{ background: "var(--bg2)", borderRadius: "var(--radius)", padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Their Story</div>
                <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{ngo.story}</p>
              </div>

              {/* AI Tip */}
              <div style={{ background: "var(--accent-light)", border: "1px solid var(--accent)", borderRadius: "var(--radius)", padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>✨ AI Tip for Helping</div>
                {loadingTip ? <div className="skeleton" style={{ height: 40 }} /> : <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{aiTip}</p>}
              </div>

              {/* Needs */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Currently Needs</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ngo.needs.map(n => <span key={n} className="need-tag">{n}</span>)}
                </div>
              </div>
            </>
          )}

          {tab === "donate" && (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 4 }}>Donation Goal</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}>{formatCurrency(ngo.donationGoal)}</div>
                <div style={{ marginTop: 12 }}>
                  <div className="progress-bar" style={{ height: 12, marginBottom: 6 }}>
                    <div className="progress-fill green" style={{ width: `${pct}%` }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text3)" }}>
                    <span>{formatCurrency(ngo.donationRaised)} raised</span>
                    <span>{pct}% of goal</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Amount</label>
                <div className="donation-amounts">
                  {[100, 500, 1000, 2000, 5000, 10000].map(a => (
                    <button key={a} className={`donation-amount-btn ${donationAmt === a && !customAmt ? "active" : ""}`}
                      onClick={() => { setDonationAmt(a); setCustomAmt(""); }}>
                      ₹{a.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Or enter custom amount (₹)</label>
                <input className="form-input" type="number" placeholder="Enter amount..." value={customAmt}
                  onChange={e => setCustomAmt(e.target.value)} min={100} />
              </div>

              <div style={{ background: "var(--green-light)", border: "1px solid var(--green)", borderRadius: "var(--radius)", padding: 12, marginBottom: 16, fontSize: 13, color: "var(--green)" }}>
                🌟 You'll earn {REWARD_ACTIONS.DONATION_MADE.points} HopePoints for this donation!
              </div>

              <button className="btn btn-primary btn-full btn-lg" onClick={handleDonate} disabled={donating}>
                {donating ? <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Processing...</> : `Donate ${formatCurrency(customAmt || donationAmt)}`}
              </button>
              <p style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", marginTop: 8 }}>🔒 Secure payment via RazorPay (simulated)</p>
            </>
          )}

          {tab === "contact" && (
            <>
              {[
                { icon: "📍", label: "Address", val: ngo.address },
                { icon: "📞", label: "Phone", val: ngo.phone },
                { icon: "📧", label: "Email", val: ngo.email },
                { icon: "🌐", label: "Website", val: ngo.website },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 36, height: 36, background: "var(--bg2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{item.val}</div>
                  </div>
                </div>
              ))}

              <div style={{ height: 16 }} />
              <button className="btn btn-primary btn-full" onClick={handleContact}>📞 Call Now</button>
              <div style={{ height: 8 }} />
              <button className="btn btn-secondary btn-full" onClick={() => { toast.info("Message sent!", "NGO will respond within 24 hours"); onClose(); }}>💬 Send Message</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── REPORT BENEFICIARY MODAL ─────────────────────────────────────────────────

const ReportModal = ({ user, onClose, onSubmit }) => {
  const [step, setStep] = useState(1); // 1: category, 2: details, 3: matching, 4: done
  const [category, setCategory] = useState("");
  const [form, setForm] = useState({ age: "", gender: "", location: "", description: "", urgency: "medium", photo: "" });
  const [matching, setMatching] = useState(false);
  const [matchedNGOs, setMatchedNGOs] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState("");

  const handleNext = async () => {
    if (step === 1 && !category) { toast.error("Please select a category"); return; }
    if (step === 2) {
      if (!form.description.trim()) { toast.error("Please describe the situation"); return; }
      setStep(3);
      setMatching(true);
      // AI matching
      try {
        const analysis = await callClaude(
          `A volunteer found a ${form.age ? form.age + "-year-old" : ""} ${form.gender || "person"} in need. Category: ${category}. Description: ${form.description}. Location: ${form.location || "unknown"}. Provide a 2-sentence assessment of urgency and what specific help they need.`,
          "You are a humanitarian assessment expert. Be compassionate and clinically precise."
        );
        setAiAnalysis(analysis);
      } catch { setAiAnalysis("This individual needs immediate assistance. Please contact the nearest facility right away."); }
      const matched = MOCK_NGOS.filter(n => n.category === category || (category === "orphanage" && n.category === "shelter")).slice(0, 3);
      setMatchedNGOs(matched.length ? matched : MOCK_NGOS.slice(0, 3));
      setMatching(false);
    } else if (step === 3) {
      setStep(4);
      onSubmit(category, form);
    } else {
      onClose();
    }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
              {step === 1 ? "What do they need?" : step === 2 ? "Tell us more" : step === 3 ? "Matching NGOs" : "Report Submitted!"}
            </h3>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text3)" }}>✕</button>
          </div>
          {/* Step indicator */}
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? "var(--accent)" : "var(--border)", transition: "all 0.3s" }} />
            ))}
          </div>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="report-category-grid">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className={`report-category-card ${category === cat.id ? "selected" : ""}`} onClick={() => setCategory(cat.id)}>
                  <div className="report-category-emoji">{cat.icon}</div>
                  <div className="report-category-label">{cat.label}</div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Approximate Age</label>
                  <input className="form-input" placeholder="e.g. 8" value={form.age} onChange={f("age")} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={f("gender")}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Current Location</label>
                <input className="form-input" placeholder="Street / Area / Landmark..." value={form.location} onChange={f("location")} />
              </div>
              <div className="form-group">
                <label className="form-label">Describe the situation *</label>
                <textarea className="form-input form-textarea" placeholder="What did you observe? How are they? Any immediate dangers?" value={form.description} onChange={f("description")} />
              </div>
              <div className="form-group">
                <label className="form-label">Urgency Level</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[{ v: "low", l: "Low 🟡", c: "#F4D03F" }, { v: "medium", l: "Medium 🟠", c: "#E67E22" }, { v: "high", l: "High 🔴", c: "#E74C3C" }].map(u => (
                    <button key={u.v} onClick={() => setForm(p => ({ ...p, urgency: u.v }))}
                      style={{ padding: "10px 4px", borderRadius: 10, border: `2px solid ${form.urgency === u.v ? u.c : "var(--border)"}`, background: form.urgency === u.v ? u.c + "22" : "var(--surface2)", cursor: "pointer", fontSize: 13, fontWeight: 600, color: form.urgency === u.v ? u.c : "var(--text3)", fontFamily: "var(--font-body)" }}>
                      {u.l}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* AI Analysis */}
              {aiAnalysis && !matching && (
                <div style={{ background: "var(--accent-light)", border: "1px solid var(--accent)", borderRadius: "var(--radius)", padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>🧠 AI Assessment</div>
                  <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{aiAnalysis}</p>
                </div>
              )}
              {matching && (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div className="spinner" style={{ marginBottom: 16 }} />
                  <p style={{ color: "var(--text2)" }}>Finding nearest NGOs...</p>
                </div>
              )}
              {!matching && matchedNGOs.map(ngo => (
                <div key={ngo.id} className="card" style={{ marginBottom: 10 }}>
                  <div style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 32 }}>{ngo.photos[0]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{ngo.name}</div>
                      <div style={{ fontSize: 13, color: "var(--text3)" }}>{formatDistance(ngo.distanceKm)} • {ngo.currentOccupancy}/{ngo.capacity} capacity</div>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={() => { toast.success("NGO Notified!", `${ngo.name} has been alerted`); }}>Alert</button>
                  </div>
                </div>
              ))}
            </>
          )}

          {step === 4 && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 8 }}>Report Submitted!</h3>
              <p style={{ color: "var(--text2)", marginBottom: 20 }}>Thank you for making a difference. The nearest NGO has been notified.</p>
              <div style={{ background: "var(--gold-light)", border: "1px solid var(--gold)", borderRadius: "var(--radius)", padding: 16 }}>
                <div style={{ fontSize: 36 }}>⭐</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>+{REWARD_ACTIONS.CONNECT_SUCCESS.points}</div>
                <div style={{ fontSize: 14, color: "var(--gold)", fontWeight: 500 }}>HopePoints Earned!</div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && step < 4 && (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
          )}
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleNext}>
            {step === 4 ? "Done" : step === 3 ? "✓ Submit Report" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────

const HomeScreen = ({ user, updateUser }) => {
  const [searchQ, setSearchQ] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  // Location state — null means not yet set
  const [userLocation, setUserLocation] = useState(() => getFromStorage("hl_location", null));
  const [addressInput, setAddressInput] = useState("");
  const [locatingGPS, setLocatingGPS] = useState(false);
  const [locationFocused, setLocationFocused] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [aiGreeting, setAiGreeting] = useState("");
  const [sortBy, setSortBy] = useState("distance");

  useEffect(() => {
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    setAiGreeting(`${greet}, ${user.name.split(" ")[0]}!`);
  }, [user.name]);

  const confirmLocation = (loc) => {
    setUserLocation(loc);
    setToStorage("hl_location", loc);
    toast.success("Location set!", `Showing NGOs near ${loc.label}`);
  };

  const handleGPS = () => {
    setLocatingGPS(true);
    // In production: navigator.geolocation.getCurrentPosition(...)
    setTimeout(() => {
      setLocatingGPS(false);
      confirmLocation({ label: "Current GPS Location", type: "gps", lat: 19.076, lng: 72.877 });
    }, 1600);
  };

  const handleAddressSubmit = () => {
    const val = addressInput.trim();
    if (!val) return;
    confirmLocation({ label: val, type: "manual", lat: 19.076, lng: 72.877 });
    setAddressInput("");
  };

  const addPoints = (pts, reason) => {
    const newPoints = (user.points || 0) + pts;
    const activity = [{ pts, reason, at: new Date().toISOString() }, ...(user.activity || [])].slice(0, 50);
    updateUser({ points: newPoints, activity });
    toast.reward(`+${pts} HopePoints!`, reason);
  };

  const handleReportSubmit = () => {
    addPoints(REWARD_ACTIONS.CONNECT_SUCCESS.points, "Reported and connected a beneficiary");
    updateUser({ helpCount: (user.helpCount || 0) + 1 });
  };

  const filtered = MOCK_NGOS.filter(n => {
    const matchQ = !searchQ || n.name.toLowerCase().includes(searchQ.toLowerCase()) || n.description.toLowerCase().includes(searchQ.toLowerCase());
    const matchCat = activeCategory === "all" || n.category === activeCategory;
    return matchQ && matchCat;
  }).sort((a, b) => sortBy === "distance" ? a.distanceKm - b.distanceKm : sortBy === "rating" ? b.rating - a.rating : b.helped - a.helped);

  const level = getRewardLevel(user.points || 0);

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div className="avatar profile-avatar" style={{ width: 44, height: 44, fontSize: 18 }}>{user.avatar}</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 14, color: "var(--text3)" }}>{aiGreeting}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="reward-badge" style={{ padding: "3px 10px", fontSize: 12 }}>{level.icon} {level.name}</span>
              <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>{(user.points || 0).toLocaleString()} pts</span>
            </div>
          </div>
        </div>

        {/* Impact Counter */}
        <div className="impact-counter">
          <div><div className="impact-num">86k+</div><div className="impact-label">Lives Helped</div></div>
          <div><div className="impact-num">312</div><div className="impact-label">NGOs Listed</div></div>
          <div><div className="impact-num">{user.helpCount || 0}</div><div className="impact-label">Your Helps</div></div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 12 }}>
          <span className="search-icon">🔍</span>
          <input placeholder="Search NGOs, causes, locations..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          {searchQ && <button onClick={() => setSearchQ("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 18 }}>✕</button>}
        </div>

        {/* Location Bar — always visible, tap to change */}
        <div
          onClick={() => setLocationFocused(true)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: userLocation ? "var(--surface)" : "var(--accent-light)",
            border: `1.5px solid ${userLocation ? "var(--border)" : "var(--accent)"}`,
            borderRadius: "var(--radius)", padding: "12px 14px",
            marginBottom: 16, cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: 20 }}>{userLocation?.type === "gps" ? "📡" : "📍"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: userLocation ? "var(--text3)" : "var(--accent)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {userLocation ? "Your Location" : "Set your location to continue"}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginTop: 1 }}>
              {userLocation ? userLocation.label : "Where are you right now?"}
            </div>
          </div>
          <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
            {userLocation ? "Change" : "Set →"}
          </span>
        </div>

        {/* Location Entry Panel — shown when no location OR user taps Change */}
        {(!userLocation || locationFocused) && (
          <div style={{
            background: "var(--surface)", border: "1.5px solid var(--accent)",
            borderRadius: "var(--radius)", padding: 16, marginBottom: 16,
            boxShadow: "0 4px 24px rgba(193,68,14,0.10)",
          }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
              {userLocation ? "Change Location" : "👋 Where are you?"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 14 }}>
              We'll show NGOs closest to you.
            </div>

            {/* GPS button */}
            <button
              onClick={e => { e.stopPropagation(); handleGPS(); }}
              disabled={locatingGPS}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px", borderRadius: "var(--radius-sm)",
                background: locatingGPS ? "var(--bg3)" : "var(--blue-light)",
                border: "1.5px solid var(--blue)", color: "var(--blue)",
                fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
                cursor: locatingGPS ? "not-allowed" : "pointer", marginBottom: 12,
                transition: "all 0.2s",
              }}
            >
              {locatingGPS
                ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0 }} /> Detecting your location…</>
                : <>📡 Use my current GPS location</>}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>or enter manually</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {/* Manual address row */}
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                flex: 1, display: "flex", alignItems: "center", gap: 8,
                background: "var(--surface2)", border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)", padding: "10px 12px",
              }}>
                <span style={{ fontSize: 15 }}>🏠</span>
                <input
                  autoFocus={!userLocation}
                  placeholder="Area, city or pincode…"
                  value={addressInput}
                  onChange={e => setAddressInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddressSubmit()}
                  onClick={e => e.stopPropagation()}
                  style={{
                    flex: 1, border: "none", background: "none", outline: "none",
                    fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text)",
                  }}
                />
                {addressInput && (
                  <button onClick={e => { e.stopPropagation(); setAddressInput(""); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
                )}
              </div>
              <button
                className="btn btn-primary"
                style={{ padding: "0 18px", whiteSpace: "nowrap" }}
                disabled={!addressInput.trim()}
                onClick={e => { e.stopPropagation(); handleAddressSubmit(); setLocationFocused(false); }}
              >
                Find NGOs
              </button>
            </div>

            {userLocation && (
              <button onClick={() => setLocationFocused(false)}
                style={{ width: "100%", marginTop: 10, padding: "8px", background: "none", border: "none", color: "var(--text3)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                Cancel
              </button>
            )}
          </div>
        )}

        {/* Gate: only show categories + list once location is known */}
        {userLocation && !locationFocused && (
          <>
            {/* Categories */}
            <div className="category-pills" style={{ marginBottom: 16 }}>
              <button className={`category-pill ${activeCategory === "all" ? "active" : ""}`} onClick={() => setActiveCategory("all")}>🌍 All</button>
              {CATEGORIES.map(c => (
                <button key={c.id} className={`category-pill ${activeCategory === c.id ? "active" : ""}`} onClick={() => setActiveCategory(c.id)}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text2)" }}>
                <span className="pulse" style={{ marginRight: 6 }} />
                {filtered.length} NGOs near <strong>{userLocation.label.split(",")[0]}</strong>
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 13, color: "var(--text2)", fontFamily: "var(--font-body)", outline: "none" }}>
                <option value="distance">Nearest First</option>
                <option value="rating">Top Rated</option>
                <option value="helped">Most Impact</option>
              </select>
            </div>

            {/* NGO List */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text3)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 8 }}>No NGOs found</div>
                <div style={{ fontSize: 14 }}>Try adjusting your search or category</div>
              </div>
            ) : filtered.map(ngo => (
              <div key={ngo.id} className="card card-hover ngo-card" style={{ marginBottom: 12 }} onClick={() => setSelectedNGO(ngo)}>
                {ngo.verified && <div className="ngo-badge">✓ Verified</div>}
                <div className="ngo-card-header">
                  <div className="ngo-emoji">{ngo.photos[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div className="ngo-name">{ngo.name}</div>
                    <div className="ngo-category">{CATEGORIES.find(c => c.id === ngo.category)?.label}</div>
                    <div className="ngo-distance"><span className="pulse" />{formatDistance(ngo.distanceKm)}</div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 4 }}>
                      <span className="stars">{"★".repeat(Math.round(ngo.rating))}</span>
                      <span style={{ fontSize: 12, color: "var(--text3)" }}>{ngo.rating} ({ngo.reviewCount})</span>
                    </div>
                  </div>
                </div>
                <p style={{ padding: "10px 16px", fontSize: 13, color: "var(--text2)", lineHeight: 1.5, borderBottom: "1px solid var(--border)" }}>{ngo.description.slice(0, 90)}...</p>
                <div className="ngo-stats">
                  <div className="ngo-stat"><div className="ngo-stat-val">{ngo.helped.toLocaleString()}</div><div className="ngo-stat-label">Helped</div></div>
                  <div className="ngo-stat"><div className="ngo-stat-val">{Math.round((ngo.donationRaised / ngo.donationGoal) * 100)}%</div><div className="ngo-stat-label">Funded</div></div>
                  <div className="ngo-stat"><div className="ngo-stat-val">{ngo.capacity - ngo.currentOccupancy}</div><div className="ngo-stat-label">Open Spots</div></div>
                </div>
                <div className="ngo-needs">
                  {ngo.needs.slice(0, 3).map(n => <span key={n} className="need-tag">{n}</span>)}
                  {ngo.needs.length > 3 && <span className="need-tag">+{ngo.needs.length - 3} more</span>}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Placeholder when location not yet set */}
        {!userLocation && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🗺️</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text2)", marginBottom: 6 }}>Set your location above</div>
            <div style={{ fontSize: 14 }}>NGOs near you will appear here</div>
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>

      {/* FAB - Report Beneficiary */}
      <button
        onClick={() => setShowReport(true)}
        style={{
          position: "fixed", bottom: 100, right: 20,
          width: 60, height: 60, borderRadius: "50%",
          background: "var(--accent)", color: "white",
          border: "none", cursor: "pointer",
          fontSize: 24, boxShadow: "0 8px 24px rgba(193,68,14,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "var(--transition)",
          zIndex: 99,
        }}
        title="Report a person in need"
        onMouseEnter={e => e.target.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.target.style.transform = "scale(1)"}
      >
        🚨
      </button>

      {selectedNGO && (
        <NGODetailModal ngo={selectedNGO} user={user} onClose={() => setSelectedNGO(null)} onAddPoints={addPoints} />
      )}
      {showReport && (
        <ReportModal user={user} onClose={() => setShowReport(false)} onSubmit={handleReportSubmit} />
      )}
    </div>
  );
};

// ─── DONATE SCREEN ────────────────────────────────────────────────────────────

const DonateScreen = ({ user, updateUser }) => {
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [filterCat, setFilterCat] = useState("all");

  const addPoints = (pts, reason) => {
    const newPoints = (user.points || 0) + pts;
    const activity = [{ pts, reason, at: new Date().toISOString() }, ...(user.activity || [])].slice(0, 50);
    updateUser({ points: newPoints, activity });
    toast.reward(`+${pts} HopePoints!`, reason);
  };

  const filtered = MOCK_NGOS.filter(n => filterCat === "all" || n.category === filterCat);

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #8B1A1A, var(--accent))", padding: "32px 16px 24px", color: "white", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>💝</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 4 }}>Make a Difference</h2>
        <p style={{ opacity: 0.85, fontSize: 14 }}>Your donation directly impacts lives</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20, background: "rgba(255,255,255,0.15)", borderRadius: "var(--radius)", padding: "14px" }}>
          <div><div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700 }}>₹47L+</div><div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Total Raised</div></div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.3)" }} />
          <div><div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700 }}>12K+</div><div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Donors</div></div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.3)" }} />
          <div><div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700 }}>6</div><div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Categories</div></div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        <div className="category-pills" style={{ marginBottom: 16 }}>
          <button className={`category-pill ${filterCat === "all" ? "active" : ""}`} onClick={() => setFilterCat("all")}>🌍 All</button>
          {CATEGORIES.map(c => <button key={c.id} className={`category-pill ${filterCat === c.id ? "active" : ""}`} onClick={() => setFilterCat(c.id)}>{c.icon} {c.label}</button>)}
        </div>

        {filtered.map(ngo => {
          const pct = Math.round((ngo.donationRaised / ngo.donationGoal) * 100);
          return (
            <div key={ngo.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 36 }}>{ngo.photos[0]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{ngo.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{ngo.helped.toLocaleString()} people helped</div>
                  </div>
                  <span className="chip chip-green">{pct}%</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div className="progress-bar">
                    <div className="progress-fill green" style={{ width: `${pct}%` }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
                    <span>{formatCurrency(ngo.donationRaised)} raised</span>
                    <span>Goal: {formatCurrency(ngo.donationGoal)}</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-full btn-sm" onClick={() => setSelectedNGO(ngo)}>
                  💝 Donate Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedNGO && (
        <NGODetailModal ngo={selectedNGO} user={user} onClose={() => setSelectedNGO(null)} onAddPoints={addPoints} />
      )}
    </div>
  );
};

// ─── REWARDS SCREEN ───────────────────────────────────────────────────────────

const RewardsScreen = ({ user }) => {
  const level = getRewardLevel(user.points || 0);
  const nextLevel = REWARD_LEVELS.find(l => l.min > (user.points || 0));
  const pctToNext = nextLevel ? Math.round(((user.points || 0) - level.min) / (nextLevel.min - level.min) * 100) : 100;
  const [aiInsight, setAiInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      try {
        const insight = await callClaude(
          `A volunteer named ${user.name} has ${user.points || 0} HopePoints and has helped ${user.helpCount || 0} people. They are at the "${level.name}" level. Give them 1 specific motivational tip to earn more points and help more people (2 sentences).`,
          "You are an inspiring volunteer coordinator. Be personal, warm, and specific."
        );
        setAiInsight(insight);
      } catch { setAiInsight("Every small act of kindness creates ripples of change. Keep going!"); }
      setLoadingInsight(false);
    };
    fetchInsight();
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${level.color}33, var(--bg))`, padding: "32px 16px 24px", textAlign: "center", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{level.icon}</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700 }}>{level.name}</div>
        <div className="points-big" style={{ margin: "8px 0" }}>{(user.points || 0).toLocaleString()}</div>
        <div style={{ fontSize: 14, color: "var(--text3)" }}>HopePoints</div>

        {nextLevel && (
          <div style={{ marginTop: 16, padding: "0 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text3)", marginBottom: 6 }}>
              <span>{level.icon} {level.name}</span>
              <span>{nextLevel.icon} {nextLevel.name}</span>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div className="progress-fill accent" style={{ width: `${pctToNext}%`, background: level.color }} />
            </div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 6 }}>
              {nextLevel.min - (user.points || 0)} points to {nextLevel.name}
            </div>
          </div>
        )}
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        {/* AI Insight */}
        {(aiInsight || loadingInsight) && (
          <div style={{ background: "var(--accent-light)", border: "1px solid var(--accent)", borderRadius: "var(--radius)", padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>✨ Your Personal Insight</div>
            {loadingInsight ? <div className="skeleton" style={{ height: 40 }} /> : <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{aiInsight}</p>}
          </div>
        )}

        {/* How to earn */}
        <div className="section">
          <div className="section-title">How to Earn Points</div>
          <div className="section-sub">Complete actions to climb levels</div>
        </div>
        {Object.entries(REWARD_ACTIONS).map(([key, val]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 40, height: 40, background: "var(--green-light)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 18, color: "var(--green)", fontWeight: 700 }}>+{val.points}</span>
            </div>
            <div style={{ flex: 1, fontSize: 14, color: "var(--text2)" }}>{val.label}</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>⭐ {val.points}</span>
          </div>
        ))}

        {/* Levels */}
        <div className="section">
          <div className="section-title">Reward Levels</div>
        </div>
        {REWARD_LEVELS.map(lvl => (
          <div key={lvl.name} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
            background: lvl.name === level.name ? lvl.color + "22" : "var(--surface)",
            border: `1.5px solid ${lvl.name === level.name ? lvl.color : "var(--border)"}`,
            borderRadius: "var(--radius)", marginBottom: 8,
          }}>
            <span style={{ fontSize: 28 }}>{lvl.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{lvl.name}</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>{lvl.min.toLocaleString()} points</div>
            </div>
            {lvl.name === level.name && <span className="chip chip-green">Current</span>}
            {(user.points || 0) > lvl.min && lvl.name !== level.name && <span>✓</span>}
          </div>
        ))}

        {/* Activity */}
        {(user.activity || []).length > 0 && (
          <>
            <div className="section">
              <div className="section-title">Recent Activity</div>
            </div>
            {(user.activity || []).slice(0, 10).map((act, i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon">⭐</div>
                <div className="activity-content">
                  <div className="activity-title">{act.reason}</div>
                  <div className="activity-meta">{timeAgo(act.at)}</div>
                </div>
                <div className="activity-points">+{act.pts}</div>
              </div>
            ))}
          </>
        )}

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
};

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────

const ProfileScreen = ({ user, updateUser, onLogout, darkMode, setDarkMode }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone || "" });
  const [aiSummary, setAiSummary] = useState("");

  useEffect(() => {
    callClaude(
      `Summarize this volunteer's impact in 2 warm sentences: Name: ${user.name}, HopePoints: ${user.points || 0}, People helped: ${user.helpCount || 0}, Level: ${getRewardLevel(user.points || 0).name}`,
      "You are a compassionate impact reporter. Be brief and inspiring."
    ).then(setAiSummary).catch(() => setAiSummary("Your kindness is making the world better, one connection at a time."));
  }, []);

  const handleSave = () => {
    updateUser({ name: form.name, email: form.email, phone: form.phone, avatar: form.name[0]?.toUpperCase() });
    setEditing(false);
    toast.success("Profile Updated!");
  };

  const level = getRewardLevel(user.points || 0);

  const settingsItems = [
    { icon: "🌙", label: "Dark Mode", action: () => setDarkMode(!darkMode), toggle: darkMode },
    { icon: "🔔", label: "Notifications", action: () => toast.info("Notifications enabled!"), toggle: true },
    { icon: "📍", label: "Location Access", action: () => toast.info("Location shared"), toggle: true },
    { icon: "🔒", label: "Privacy Settings", action: () => toast.info("Privacy center") },
    { icon: "❓", label: "Help & Support", action: () => toast.info("Support center") },
    { icon: "📋", label: "Terms & Privacy", action: () => toast.info("Terms page") },
  ];

  return (
    <div>
      <div className="profile-header">
        <div className="avatar profile-avatar" style={{ width: 80, height: 80, fontSize: 32, margin: "0 auto 12px", border: "3px solid var(--surface)", boxShadow: "var(--shadow-md)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
          {user.avatar}
        </div>
        {editing ? (
          <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ textAlign: "center", fontSize: 18, fontWeight: 600 }} />
        ) : (
          <div className="profile-name">{user.name}</div>
        )}
        <div className="profile-role">{user.role === "volunteer" ? "🙋 Volunteer" : user.role === "ngo" ? "🏛️ NGO Admin" : "💝 Donor"}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
          <span className="reward-badge">{level.icon} {level.name}</span>
          <span className="chip chip-blue">🗓️ Since {new Date(user.joinedAt).getFullYear()}</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        {/* AI Impact Summary */}
        {aiSummary && (
          <div style={{ background: "var(--accent-light)", border: "1px solid var(--accent)", borderRadius: "var(--radius)", padding: 14, marginBottom: 20, fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
            ✨ {aiSummary}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "HopePoints", val: (user.points || 0).toLocaleString(), icon: "⭐" },
            { label: "People Helped", val: user.helpCount || 0, icon: "🤝" },
            { label: "Donations", val: user.donationTotal || 0, icon: "💝" },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--accent)", marginTop: 4 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Edit Profile */}
        {editing ? (
          <div className="card" style={{ marginBottom: 16, padding: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-secondary btn-full" style={{ marginBottom: 16 }} onClick={() => setEditing(true)}>✏️ Edit Profile</button>
        )}

        {/* Settings */}
        <div className="card" style={{ marginBottom: 16 }}>
          {settingsItems.map((item, i) => (
            <div key={i} onClick={item.action} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px",
              borderBottom: i < settingsItems.length - 1 ? "1px solid var(--border)" : "none",
              cursor: "pointer",
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: 15 }}>{item.label}</span>
              {"toggle" in item ? (
                <label className="switch" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={item.toggle} onChange={item.action} />
                  <span className="switch-track" />
                  <span className="switch-thumb" />
                </label>
              ) : (
                <span style={{ color: "var(--text3)" }}>›</span>
              )}
            </div>
          ))}
        </div>

        <button className="btn btn-ghost btn-full" style={{ color: "#E74C3C", borderColor: "#E74C3C33" }} onClick={onLogout}>
          🚪 Sign Out
        </button>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  useEffect(() => { injectStyles(); }, []);

  const { user, login, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [darkMode, setDarkMode] = useState(() => getFromStorage("hl_dark", false));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    setToStorage("hl_dark", darkMode);
  }, [darkMode]);

  if (!user) return (
    <>
      <LoginScreen onLogin={login} />
      <ToastContainer />
    </>
  );

  const tabs = [
    { id: "home", icon: "🏠", label: "Discover" },
    { id: "donate", icon: "💝", label: "Donate" },
    { id: "rewards", icon: "⭐", label: "Rewards" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <div className="app-shell">
      <ToastContainer />

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <a className="logo" href="#">
            <div className="logo-mark">🤝</div>
            <span className="logo-text">Hope<span>Link</span></span>
          </a>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setDarkMode(!darkMode)}
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {darkMode ? "☀️" : "🌙"}
            </button>
            <div className="avatar" style={{ width: 36, height: 36, fontSize: 15 }}>{user.avatar}</div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        {activeTab === "home" && <HomeScreen user={user} updateUser={updateUser} />}
        {activeTab === "donate" && <DonateScreen user={user} updateUser={updateUser} />}
        {activeTab === "rewards" && <RewardsScreen user={user} />}
        {activeTab === "profile" && <ProfileScreen user={user} updateUser={updateUser} onLogout={logout} darkMode={darkMode} setDarkMode={setDarkMode} />}
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {tabs.map(tab => (
          <button key={tab.id} className={`nav-item ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
