// Pre-seeds 200 demo reports for showcase purposes.
// Pins are spread across outer Chattogram — Hathazari, Sitakunda, Mirsarai,
// Patiya, Anwara, Banshkhali, Boalkhali, Chandanaish, Raozan, Sandwip shore.
// Usage: npm run seed:demo
// Safe to re-run: checks row count first, skips if already seeded.

import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb } from "../src/lib/db";
import { reports } from "../src/lib/db/schema";
import { count } from "drizzle-orm";

type Category = "medical" | "food" | "status";
type FloodStatus = "flooded" | "safe" | "not_in_danger";
type AidStatus = "needs_aid" | "in_progress" | "aided" | null;

interface DemoPin {
  lat: number;
  lng: number;
  address: string;
  category: Category;
  floodStatus: FloodStatus;
  aidStatus: AidStatus;
}

// Outer Chattogram areas — clusters around each upazila/thana perimeter.
const DEMO_PINS: DemoPin[] = [
  // ── HATHAZARI (north) ──────────────────────────────────────────────────
  { lat: 22.5091, lng: 91.8151, address: "Hathazari Bazar, Hathazari", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5023, lng: 91.8247, address: "Forhadabad Union, Hathazari", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4974, lng: 91.8063, address: "Garduara, Hathazari", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.5189, lng: 91.8312, address: "Mekhal Union, Hathazari", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.5234, lng: 91.8094, address: "Burishchhar, Hathazari", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.4851, lng: 91.8178, address: "Dharmapur, Hathazari", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.5312, lng: 91.8401, address: "Chikandandi, Hathazari", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4768, lng: 91.8234, address: "Narayanhat, Hathazari", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5067, lng: 91.7989, address: "Gumnamar Para, Hathazari", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.5401, lng: 91.8189, address: "Mirzapur, Hathazari", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4923, lng: 91.8356, address: "Katirhat, Hathazari", category: "food", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.5156, lng: 91.8478, address: "Fateh Khan, Hathazari", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.4812, lng: 91.7934, address: "Sholashahar, Hathazari", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5289, lng: 91.8523, address: "Nangalmora, Hathazari", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5445, lng: 91.8267, address: "Golap Bag, Hathazari", category: "status", floodStatus: "flooded", aidStatus: null },

  // ── SITAKUNDA (north coast) ────────────────────────────────────────────
  { lat: 22.6234, lng: 91.6612, address: "Sitakunda Bazar, Sitakunda", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6089, lng: 91.6534, address: "Barabkunda, Sitakunda", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6378, lng: 91.6701, address: "Kumira, Sitakunda", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.5956, lng: 91.6489, address: "Bhatiyari, Sitakunda", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.6512, lng: 91.6623, address: "Salna Ghat, Sitakunda", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.6145, lng: 91.6789, address: "Fauzdarhat, Sitakunda", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.6289, lng: 91.6456, address: "Sonaichhari, Sitakunda", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5878, lng: 91.6567, address: "Shitalpur, Sitakunda", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6423, lng: 91.6834, address: "Bariyadhala, Sitakunda", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.6034, lng: 91.6412, address: "Sahachhari, Sitakunda", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6567, lng: 91.6578, address: "Chandpur Ghat, Sitakunda", category: "food", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.5934, lng: 91.6723, address: "Muradpur, Sitakunda", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.6712, lng: 91.6645, address: "Guliakhali, Sitakunda", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6178, lng: 91.6389, address: "Nandirhat, Sitakunda", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },

  // ── MIRSARAI (far north) ───────────────────────────────────────────────
  { lat: 22.7156, lng: 91.5867, address: "Mirsarai Bazar, Mirsarai", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.7034, lng: 91.5712, address: "Zorarganj, Mirsarai", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.7289, lng: 91.5934, address: "Ichhakhali, Mirsarai", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.6934, lng: 91.5645, address: "Hinguli, Mirsarai", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.7423, lng: 91.5789, address: "Khaiyachhari, Mirsarai", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.7067, lng: 91.6012, address: "Osmanpur, Mirsarai", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.7512, lng: 91.5923, address: "Durgapur, Mirsarai", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6856, lng: 91.5778, address: "Mayani, Mirsarai", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.7345, lng: 91.6089, address: "Wahedpur, Mirsarai", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.7189, lng: 91.5534, address: "Saherkhali, Mirsarai", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6978, lng: 91.6134, address: "Azampur, Mirsarai", category: "food", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.7578, lng: 91.5845, address: "Katachari, Mirsarai", category: "status", floodStatus: "flooded", aidStatus: null },

  // ── PATIYA (south) ─────────────────────────────────────────────────────
  { lat: 22.2934, lng: 91.9823, address: "Patiya Bazar, Patiya", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2812, lng: 91.9712, address: "Kharana, Patiya", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3056, lng: 91.9945, address: "Jhilwala, Patiya", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.2689, lng: 91.9634, address: "Shialuk, Patiya", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.3178, lng: 91.9867, address: "Dhalem, Patiya", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.2756, lng: 91.9778, address: "Haidgaon, Patiya", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.3234, lng: 92.0012, address: "Kusumpura, Patiya", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2623, lng: 91.9556, address: "Chorwara, Patiya", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3089, lng: 91.9734, address: "Magdhara, Patiya", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.2534, lng: 91.9689, address: "Khankhanabad, Patiya", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3312, lng: 91.9923, address: "Kelishahar, Patiya", category: "food", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.2878, lng: 92.0056, address: "Dhalghat, Patiya", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.3401, lng: 91.9812, address: "Nazirhat, Patiya", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2712, lng: 91.9912, address: "Juldha, Patiya", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2989, lng: 91.9645, address: "Rashidabad, Patiya", category: "status", floodStatus: "flooded", aidStatus: null },

  // ── ANWARA (south) ─────────────────────────────────────────────────────
  { lat: 22.2234, lng: 91.8912, address: "Anwara Sadar, Anwara", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2112, lng: 91.8823, address: "Paraikora, Anwara", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2356, lng: 91.9034, address: "Raypur, Anwara", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.1989, lng: 91.8712, address: "Chatri, Anwara", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.2478, lng: 91.8956, address: "Haildhar, Anwara", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.2056, lng: 91.8867, address: "Badalghat, Anwara", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.2589, lng: 91.9112, address: "Shachaitel, Anwara", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.1878, lng: 91.8778, address: "Barakhain, Anwara", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2312, lng: 91.8645, address: "Juldha Nagar, Anwara", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.1756, lng: 91.8934, address: "Bariyapur, Anwara", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2689, lng: 91.9178, address: "Gahira, Anwara", category: "food", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.2178, lng: 91.9023, address: "Rajanagar, Anwara", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.1934, lng: 91.8623, address: "Jafarabad, Anwara", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2423, lng: 91.8534, address: "Kolgaon, Anwara", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },

  // ── BANSHKHALI (far south) ─────────────────────────────────────────────
  { lat: 22.0823, lng: 92.0234, address: "Banshkhali Sadar, Banshkhali", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.0712, lng: 92.0112, address: "Baharchara, Banshkhali", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.0934, lng: 92.0345, address: "Pukuria, Banshkhali", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.0589, lng: 92.0023, address: "Chilla, Banshkhali", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.1056, lng: 92.0456, address: "Saral, Banshkhali", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.0678, lng: 92.0189, address: "Katharia, Banshkhali", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.1134, lng: 92.0567, address: "Sorail, Banshkhali", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.0456, lng: 91.9934, address: "Chandpur, Banshkhali", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.0867, lng: 92.0312, address: "Kalauzan, Banshkhali", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.0378, lng: 92.0056, address: "Gundamara, Banshkhali", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.1212, lng: 92.0623, address: "Sekherkhil, Banshkhali", category: "food", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.0534, lng: 92.0278, address: "Baisharabkul, Banshkhali", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.0289, lng: 91.9878, address: "Chambol, Banshkhali", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.0967, lng: 92.0489, address: "Khankhanaabad, Banshkhali", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },

  // ── BOALKHALI (east of Karnaphuli) ────────────────────────────────────
  { lat: 22.3712, lng: 92.0423, address: "Boalkhali Bazar, Boalkhali", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3589, lng: 92.0312, address: "Gahira, Boalkhali", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3834, lng: 92.0534, address: "Kharnaphuli, Boalkhali", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.3456, lng: 92.0189, address: "Aminul Para, Boalkhali", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.3956, lng: 92.0645, address: "Chorkhain, Boalkhali", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.3678, lng: 92.0478, address: "Noapara, Boalkhali", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.4034, lng: 92.0712, address: "Saroatali, Boalkhali", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3523, lng: 92.0245, address: "Sujanpur, Boalkhali", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3889, lng: 92.0578, address: "Ahmednagar, Boalkhali", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.3412, lng: 92.0134, address: "Purba Guzra, Boalkhali", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4112, lng: 92.0789, address: "Jalilabad, Boalkhali", category: "food", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.3756, lng: 92.0367, address: "Shilkupara, Boalkhali", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.3334, lng: 92.0067, address: "Kodalia, Boalkhali", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4189, lng: 92.0845, address: "Jamidar Hat, Boalkhali", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },

  // ── CHANDANAISH (southeast) ────────────────────────────────────────────
  { lat: 22.2534, lng: 92.0512, address: "Chandanaish Bazar, Chandanaish", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2412, lng: 92.0389, address: "Barasat, Chandanaish", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2656, lng: 92.0623, address: "Dhopachhari, Chandanaish", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.2289, lng: 92.0267, address: "Jangal Khain, Chandanaish", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.2778, lng: 92.0734, address: "Satoikain, Chandanaish", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.2456, lng: 92.0456, address: "Baraghona, Chandanaish", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.2834, lng: 92.0845, address: "Dohazari, Chandanaish", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2178, lng: 92.0178, address: "Kanchanabad, Chandanaish", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2623, lng: 92.0567, address: "Hassanabad, Chandanaish", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.2067, lng: 92.0312, address: "Satbaria, Chandanaish", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2912, lng: 92.0912, address: "Baiddachhari, Chandanaish", category: "food", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.2345, lng: 92.0678, address: "Madhyam Satbaria, Chandanaish", category: "status", floodStatus: "flooded", aidStatus: null },

  // ── RAOZAN (northeast) ─────────────────────────────────────────────────
  { lat: 22.4678, lng: 91.9412, address: "Raozan Bazar, Raozan", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4556, lng: 91.9289, address: "Urkirchar, Raozan", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4812, lng: 91.9534, address: "Nobipur, Raozan", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.4423, lng: 91.9156, address: "Pahartali, Raozan", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.4934, lng: 91.9645, address: "Guzra, Raozan", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.4612, lng: 91.9467, address: "Binazuri, Raozan", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.5012, lng: 91.9756, address: "Islamabad, Raozan", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4345, lng: 91.9023, address: "Durgapura, Raozan", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4889, lng: 91.9578, address: "Karnaful, Raozan", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.4234, lng: 91.9178, address: "Mohamaya, Raozan", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5089, lng: 91.9867, address: "Patenga Union, Raozan", category: "food", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.4756, lng: 91.9345, address: "Sultanpur, Raozan", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.4112, lng: 91.9234, address: "Char Lakshmi, Raozan", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5167, lng: 91.9934, address: "Gazipur, Raozan", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },

  // ── FATIKCHHARI (far north) ────────────────────────────────────────────
  { lat: 22.6456, lng: 91.7834, address: "Fatikchhari Bazar, Fatikchhari", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6334, lng: 91.7712, address: "Narayanhat, Fatikchhari", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6578, lng: 91.7956, address: "Harwalchhari, Fatikchhari", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.6212, lng: 91.7589, address: "Bhuujpur, Fatikchhari", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.6712, lng: 91.8067, address: "Kanchanabad, Fatikchhari", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.6389, lng: 91.7867, address: "Lelang, Fatikchhari", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.6823, lng: 91.8145, address: "Najirhat, Fatikchhari", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6089, lng: 91.7645, address: "Rosangiri, Fatikchhari", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6634, lng: 91.7978, address: "Dantmara, Fatikchhari", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.6923, lng: 91.8234, address: "Suarkhain, Fatikchhari", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6167, lng: 91.7778, address: "Abdullahpur, Fatikchhari", category: "food", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.6745, lng: 91.8089, address: "Khirni Chhari, Fatikchhari", category: "status", floodStatus: "flooded", aidStatus: null },

  // ── SANDWIP SHORE / PATENGA OUTER ─────────────────────────────────────
  { lat: 22.3234, lng: 91.7234, address: "Shah Amanat Bridge area, Patenga", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3156, lng: 91.7123, address: "Halishahar Shore, Patenga", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3312, lng: 91.7345, address: "Bandartila, Patenga", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.3078, lng: 91.7012, address: "Char Patharghata, Patenga", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.3389, lng: 91.7456, address: "Aziznagar Shore, Patenga", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.3001, lng: 91.6934, address: "Hossainabad Shore, Patenga", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.3467, lng: 91.7567, address: "Rajakhali, Patenga", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2923, lng: 91.6856, address: "Chalna, outer shore", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3545, lng: 91.7634, address: "Sarikait, Patenga", category: "status", floodStatus: "not_in_danger", aidStatus: null },

  // ── KARNAPHULI (south bank outer) ─────────────────────────────────────
  { lat: 22.3034, lng: 91.8156, address: "Ichamati, Karnaphuli", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2956, lng: 91.8234, address: "Char Lakshmi, Karnaphuli", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3112, lng: 91.8312, address: "Juicchara, Karnaphuli", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.2878, lng: 91.8078, address: "Char Patharghata, Karnaphuli", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.3189, lng: 91.8389, address: "Kalirhat, Karnaphuli", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.2812, lng: 91.8145, address: "Baishiari, Karnaphuli", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.3267, lng: 91.8467, address: "Mongakhali, Karnaphuli", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2734, lng: 91.8023, address: "Sripur Khalpar, Karnaphuli", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3345, lng: 91.8545, address: "Sadarghat Outer, Karnaphuli", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.2656, lng: 91.8289, address: "Jangalkhain, Karnaphuli", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },

  // ── ADDITIONAL OUTER RING (filling to 200) ─────────────────────────────
  { lat: 22.4512, lng: 91.7312, address: "Bayezid Outer, north Ctg", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4389, lng: 91.7189, address: "Muradpur Outer, north Ctg", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4634, lng: 91.7434, address: "Pahartali Outer, north Ctg", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.4267, lng: 91.7067, address: "Nasirabad outer, north Ctg", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.4756, lng: 91.7556, address: "Khulshi Outer, north Ctg", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.4145, lng: 91.7145, address: "Panchlaish Outer, north Ctg", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.4878, lng: 91.7667, address: "Oxygen Mor Outer, north Ctg", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4023, lng: 91.7023, address: "Sholoshahar outer, north Ctg", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.4967, lng: 91.7778, address: "Dampara Outer, north Ctg", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.3901, lng: 91.6956, address: "Lalkhan Bazar shore area", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5056, lng: 91.7889, address: "CUET Area, Raozan border", category: "food", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.3823, lng: 91.6878, address: "Wasa area outer, west Ctg", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.5145, lng: 91.8001, address: "Foyez Lake outer, north", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3745, lng: 91.6812, address: "Kotwali west shore", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5223, lng: 91.7923, address: "Muradpur outer north", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.5378, lng: 91.8156, address: "Hathazari border south", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3656, lng: 91.6734, address: "Sadarghat west outer", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5467, lng: 91.8278, address: "Madrasa Para, Hathazari border", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.3578, lng: 91.6656, address: "Askar Dighir Par, west shore", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.5556, lng: 91.8389, address: "Nandirhat border, north", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.3501, lng: 91.6578, address: "Eidgah outer, west shore", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.5634, lng: 91.8501, address: "Borodighirpar, north outer", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3423, lng: 91.6501, address: "West Madarbari shore", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5712, lng: 91.8612, address: "Katirhat outer, north", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.4056, lng: 92.0956, address: "Boalkhali east outer", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.2156, lng: 91.9456, address: "Anwara east outer", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6856, lng: 91.7534, address: "Fatikchhari south border", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.1567, lng: 92.0678, address: "Banshkhali north border", category: "medical", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.4289, lng: 92.0956, address: "Boalkhali northeast border", category: "food", floodStatus: "not_in_danger", aidStatus: "needs_aid" },
  { lat: 22.1423, lng: 91.9423, address: "Anwara southwest outer", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.6723, lng: 91.8345, address: "Fatikchhari east border", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.1289, lng: 92.0456, address: "Banshkhali coast outer", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5823, lng: 91.8723, address: "Hathazari far outer north", category: "status", floodStatus: "not_in_danger", aidStatus: null },
  { lat: 22.1145, lng: 91.9901, address: "Banshkhali inland outer", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.5934, lng: 91.8834, address: "Mirsarai south border", category: "food", floodStatus: "flooded", aidStatus: "in_progress" },
  { lat: 22.1001, lng: 91.9723, address: "Banshkhali far south", category: "status", floodStatus: "flooded", aidStatus: null },
  { lat: 22.6045, lng: 91.8945, address: "Mirsarai coast south", category: "medical", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.3156, lng: 92.0623, address: "Patiya east outer", category: "food", floodStatus: "flooded", aidStatus: "needs_aid" },
  { lat: 22.6156, lng: 91.9056, address: "Sitakunda inner ring", category: "status", floodStatus: "not_in_danger", aidStatus: null },
];

const DEMO_PHONE = "+8801000000000";
const DEMO_EMAIL = "demo@sinkedin.app";

async function main() {
  const db = getDb();

  const [{ value: existingCount }] = await db.select({ value: count() }).from(reports);
  if (Number(existingCount) >= 100) {
    console.log(`Already have ${existingCount} reports — skipping demo seed. Run with --force to re-seed.`);
    const forceFlag = process.argv.includes("--force");
    if (!forceFlag) return;
    console.log("--force detected, continuing...");
  }

  let created = 0;
  const BATCH = 20;
  for (let i = 0; i < DEMO_PINS.length; i += BATCH) {
    const batch = DEMO_PINS.slice(i, i + BATCH);
    await db.insert(reports).values(
      batch.map((p) => ({
        phone: DEMO_PHONE,
        email: DEMO_EMAIL,
        latitude: String(p.lat),
        longitude: String(p.lng),
        address: p.address,
        floodStatus: p.floodStatus,
        aidStatus: p.aidStatus ?? undefined,
        category: p.category,
        isProxy: false,
      })),
    );
    created += batch.length;
    console.log(`Seeded ${created}/${DEMO_PINS.length}...`);
  }

  console.log(`Demo seed complete: ${created} reports inserted across outer Chattogram.`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
