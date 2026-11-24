# PokéVault UK — Pokémon TCG Repository, Set Tracker & Price Finder 🇬🇧

A fast, responsive web application designed for Pokémon Trading Card Game (TCG) collectors in the United Kingdom. Browse all Pokémon TCG sets, inspect individual cards in high resolution, track your personal collection (including variants like Holo and Reverse Holo), and find the cheapest places to buy each card online with verified UK delivery.

---

## ⚡ Key Features

1. **Complete Set & Card Repository**:
   - Choose any Pokémon TCG set by name (from classic 1999 Base Set and Neo to modern Scarlet & Violet, 151, Surging Sparks, and Prismatic Evolutions).
   - Filter sets by Series (Scarlet & Violet, Sword & Shield, Sun & Moon, XY, Black & White, Base & Neo).
   - View every card in a rich visual grid with card number, energy type, rarity badge, and high-definition artwork.

2. **Personal Collection Tracker ("I Have This Card") & Central Database**:
   - **Central Database Sync Across Devices**: Built-in persistent database (`data/collection_db.json`) running on your Mac. When you check off a card or adjust variants on your phone, it syncs directly to your Mac's database in real time!
   - **Real-Time Live Updates**: Uses Server-Sent Events (SSE) so changes made on your phone instantly reflect on your Mac screen without needing a page refresh.
   - **One-Click Toggle**: Mark any card as owned directly from the grid.
   - **Variant & Quantity Counter**: Specify copies for Regular, Holofoil, Reverse Holo, and 1st Edition variants.
   - **Card Notes**: Store notes on condition (e.g., Near Mint, Lightly Played) or grading.
   - **Live Progress Bar**: Real-time set completion percentage and owned card tally.
   - **Collection Backup & Restore**: Export and import your collection anytime as a JSON file.

3. **Where to Buy in the UK (Sorted Cheapest First)**:
   - **eBay UK**: Direct search link pre-filtered to the Pokémon Individual Cards category, item location restricted to **UK Only** (`LH_PrefLoc=1`), and automatically sorted by **Price + Postage: lowest first** (`_sop=15`).
   - **Cardmarket (UK & EU)**: Europe and the UK's premier singles platform with direct links to live listings (sorted lowest price first by default) and Cardmarket market price reference in GBP (£).
   - **Magic Madhouse UK**: Direct search link on the UK's leading dedicated TCG store.
   - **Chaos Cards UK**: Direct search link on one of the UK's top hobby retailers.
   - **Total Cards UK**: Direct link to UK independent card specialist.
   - **Go Cards UK**: Direct link to UK specialist Pokémon single cards and slabs shop.

4. **Offline Caching & Optional API Key**:
   - Works immediately out-of-the-box with browser-level caching.
   - Optional setting to add a free API key from [pokemontcg.io](https://pokemontcg.io) for elevated 20,000 req/day limits.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or later)
- npm

### Installation & Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 🛠 Tech Stack
- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Data & API**: Pokémon TCG API (pokemontcg.io) + Cardmarket price guides + eBay UK search queries
- **State & Storage**: React Context + LocalStorage with JSON backup
