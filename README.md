# 🧙‍♂️ Intelligenter Fitness Tracker

Ein KI-basierter Trainingsplan-Generator mit intelligentem Assistenten, der personalisierte Workouts erstellt.

## 🎯 Features

- **7-Schritt Intelligenter Assistent** - Geführte Plan-Erstellung
- **Personalisierte Trainingspläne** - Basierend auf Equipment, Zielen & Erfahrung  
- **Smart Exercise Database** - 50+ Übungen kategorisiert und gefiltert
- **Progressive Web App** - Funktioniert offline, installierbar
- **Multi-Level System** - Verschiedene Tracker für verschiedene Nutzer

## 📁 File-Struktur

### 🎯 Haupt-App
- **`index.html`** - Intelligenter Fitness Tracker (7-Schritt Assistent)

### ⚙️ System-Files  
- **`manifest.json`** - PWA Konfiguration
- **`sw.js`** - Service Worker für Offline-Funktionalität
- **`api.php`** - Backend API (optional)
- **`debug-api.php`** - Debug Version der API

## 🚀 Quick Start

1. **Direkt nutzen**: `index.html` öffnen
2. **7-Schritt Setup** durchlaufen
3. **Personalisierten Plan** erhalten
4. **Training tracken** und Fortschritt sehen

## 🧠 Intelligente Features

### Plan-Generierung
- **Equipment-Filter**: Nur verfügbare Geräte
- **Ziel-optimiert**: Muskelaufbau vs Kraft vs Ausdauer  
- **Erfahrungs-angepasst**: Anfänger bis Profi
- **Fokus-basiert**: Ganzkörper, Split, spezifische Bereiche

### Exercise Database
```javascript
"Eigengewicht" // Liegestütz, Kniebeuge, Klimmzug...
"Kurzhanteln"  // Bankdrücken, Curls, Rudern...
"Langhanteln"  // Kniebeuge, Kreuzheben, Military Press...
"Gym-Geräte"   // Beinpresse, Latzug, Kabelzug...
```

### Smart Splits
- **2-3 Tage**: Oberkörper/Unterkörper
- **4+ Tage**: Push/Pull/Legs oder spezifische Splits
- **Ganzkörper**: Alle Muskelgruppen pro Einheit

## 🎮 User Experience

### Setup-Assistent
1. **Willkommen** - Name & Alter
2. **Ziele** - Muskelaufbau, Kraft, Ausdauer...
3. **Erfahrung** - Anfänger bis Profi
4. **Equipment** - Verfügbare Ausrüstung  
5. **Fokus** - Körperbereiche auswählen
6. **Schedule** - Häufigkeit & Dauer
7. **Summary** - Plan-Generierung

### Training Interface
- **Progress Tracking** - Exercise & Day completion
- **Visual Feedback** - Fortschrittsbalken & Statistiken
- **Responsive Design** - Mobile-first, aber desktop-ready
- **Offline-fähig** - Funktioniert ohne Internet

## 💾 Daten-Management

### Lokale Speicherung
```javascript
localStorage.setItem('fitness_user_data', userData);
localStorage.setItem('fitness_current_plan', plan);
```

### API-Sync (optional)
- Automatische Synchronisation wenn verfügbar
- Fallback auf lokale Speicherung
- Session-Tracking für Fortschritt

## 🔧 Technische Details

### Frontend
- **Vanilla JavaScript** - Keine Dependencies
- **Tailwind CSS** - Utility-first Styling
- **PWA-Ready** - Service Worker + Manifest

### Backend (optional)
- **PHP API** - Einfache REST Endpoints
- **File-based Storage** - Keine Datenbank nötig
- **CORS-enabled** - Cross-origin requests

## 🎯 Spezialisierte Tracker

### Benni's Tracker (archiviert)
- **Jugend-optimiert** (13 Jahre)
- **Gym-Geräte Fokus** - Stepper, Ergometer, Maschinen
- **Detaillierte Erklärungen** - Jede Übung erklärt
- **7-Tage Oberkörper Plan** - Arm & Core Training

### Original Tracker (archiviert)
- **Fester 2-Wochen Plan** - Push/Pull/Legs
- **Erwachsenen-orientiert** - Komplexere Übungen
- **Timer-Integration** - Satzpausen tracking

## 🚀 Deployment

### Lokal
```bash
# Einfach Files in Webserver-Ordner
cp *.html /var/www/html/
```

### Mit API
```bash
# PHP-fähiger Server nötig
php -S localhost:8000
```

### PWA Installation
- Chrome: "Zur Startseite hinzufügen"
- iOS Safari: "Zum Home-Bildschirm"

## 🔮 Roadmap

- [ ] **Ernährungs-Integration** - Meal planning
- [ ] **Social Features** - Freunde hinzufügen
- [ ] **Analytics** - Langzeit-Tracking  
- [ ] **Video-Guides** - Übungsanleitungen
- [ ] **Wearable-Sync** - Fitness tracker integration

## 💡 Usage Examples

### Anfänger-Setup
```
Ziele: [Muskelaufbau, Gesundheit]
Erfahrung: Anfänger  
Equipment: [Eigengewicht, Kurzhanteln]
Fokus: [Ganzkörper]
Schedule: 3x/Woche, 45min
→ Ergebnis: 3-Tage Ganzkörper-Plan
```

### Fortgeschrittener-Setup  
```
Ziele: [Kraft, Muskelaufbau]
Erfahrung: Fortgeschritten
Equipment: [Langhanteln, Gym-Geräte]  
Fokus: [Oberkörper, Unterkörper]
Schedule: 5x/Woche, 60min
→ Ergebnis: 5-Tage Push/Pull/Legs Split
```

---

**🎉 Ready to get fit? Start with `index.html`!**

