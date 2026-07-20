# 🌟 Aura Todo | Premium Task Manager

Aura Todo is a sleek, premium, glassmorphic task manager built with modern web technologies. Designed for individuals who appreciate elegant design, it offers a visual experience with glassmorphism effects, customizable themes (Dark/Light), micro-animations, and dynamic progress tracking.

---

## ✨ Features

- **🎨 Modern Glassmorphic Design:** A premium interface featuring backdrop filters, glowing background blobs, dynamic shadows, and polished typography using the *Plus Jakarta Sans* typeface.
- **🌓 Dynamic Theme Toggle:** Seamless switching between Dark Mode and Light Mode with theme memory.
- **📊 Real-time Stats & Progress:** An animated, SVG-based circular progress ring tracks your productivity alongside pending, completed, and starred counters.
- **🏷️ Categories & Tagging:** Color-coded categorization (`Personal`, `Work`, `Shopping`, `Fitness`) with unique gradient indicators.
- **⚡ Priority & Due Dates:** Manage urgency with priority levels (`Low`, `Medium`, `High`) and absolute due dates.
- **🔍 Instant Search & Filters:** Real-time search indexing and filters (`All`, `Pending`, `Completed`, `Starred`) to navigate tasks instantly.
- **↕️ Advanced Sorting:** Sort tasks dynamically by *Newest First*, *Oldest First*, *Due Soonest*, or *Priority (High to Low)*.
- **📝 Modal Task Editing:** Edit task titles, categories, priorities, and deadlines inline using a responsive pop-up modal.
- **💾 Local Storage Persistence:** Automatically saves your lists, theme preference, and task configurations so you never lose your progress.
- **🎉 Completion Confetti:** A custom canvas-based particle confetti system to celebrate your completed goals!

---

## 🛠️ Tech Stack & Dependencies

- **HTML5:** Semantic architecture.
- **CSS3:** Custom properties (variables), Flexbox, CSS Grid, custom keyframes, transition effects, and glassmorphism.
- **JavaScript (ES6+):** Vanilla state management, custom canvas-based particles, and LocalStorage APIs.
- **Icons & Fonts:** Font Awesome 6.4.0, Google Fonts (Plus Jakarta Sans).
- **Dev Server:** Lightweight `http-server` for local hosting.

---

## 📂 Project Structure

```
Aura Todo/
├── index.html          # HTML structure, UI layout, SVGs, modals
├── style.css           # UI Design System (Glassmorphic variables, dark/light styles, animations)
├── app.js              # Application core, local storage sync, sorting, filtering, confetti canvas
├── package.json        # Dependencies & start scripts
└── package-lock.json   # Package dependency tree lockfile
```

---

## 🚀 Getting Started

Follow these quick steps to set up and run Aura Todo locally on your machine.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. Clone or extract this repository to your local directory.
2. Open your terminal in the project root folder.
3. Install the dev dependencies:
   ```bash
   npm install
   ```

### Running Locally

To run the application on a local development server:

```bash
npm run dev
# OR
npm start
```

Once started, open your browser and navigate to:
```
http://localhost:3000
```

---

## ⚡ Development & Scripts

- **`npm run dev` / `npm start`**: Starts a local development server using `http-server` on port `3000`.

---

## 📝 Customization

You can customize categories, color schemes, and sorting behavior inside the configuration section of [app.js](file:///C:/Users/ACER/Desktop/To-Do%20web/app.js):

```javascript
const CATEGORIES = {
    personal: { name: 'Personal', color: '#8b5cf6', gradientEnd: '#ec4899' },
    work: { name: 'Work', color: '#0ea5e9', gradientEnd: '#4f46e5' },
    shopping: { name: 'Shopping', color: '#ec4899', gradientEnd: '#f59e0b' },
    fitness: { name: 'Fitness', color: '#10b981', gradientEnd: '#059669' }
};
```

---

Built with ❤️ and modern UI design principles.
