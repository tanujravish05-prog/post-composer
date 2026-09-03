# EXP 4: Interactive Calendar Post Scheduler & Performance Engineering

**Course Outcome Alignment:**
- **CO3 - BT3**: Implement calendar-based scheduling interfaces, state management (Redux Toolkit), and time-based temporal layouts.
- **CO4 - BT4**: Optimize rendering performance using memoization (`React.memo`, `useMemo`, `useCallback`) to reduce unnecessary re-renders in complex UI components.
- **CO5 - BT5**: Design and execute automated unit and integration testing strategies using Vitest and React Testing Library.

---

## 🌟 Overview & Features

PostPulse Calendar is a modern, high-performance interactive post scheduling web application built for social media content planners.

### 📅 Key Capabilities
1. **Multi-View Calendar System**:
   - **Month View**: 35/42-day responsive calendar grid with density indicators and memoized day cells.
   - **Week View**: 7-day hourly grid (00:00 to 23:00) mapping posts directly to specific temporal slots.
   - **Day View**: Detailed 24-hour vertical timeline with live post management cards.
2. **Drag-and-Drop Rescheduling**:
   - HTML5 drag-and-drop allows dragging any post badge onto date cells or hour time slots to instantly update scheduled execution dates and times in Redux state.
3. **Multi-Channel Social Support**:
   - Platform-specific badges and branding for **X/Twitter**, **Instagram**, **LinkedIn**, **YouTube**, **Facebook**, and **Threads**.
4. **Simulated Social Feed Preview**:
   - Realistic smartphone mockup preview showing how scheduled posts will appear when published.
5. **CO4 Performance Telemetry Panel**:
   - Live overlay counter displaying active memoization efficiency, render counters, and performance bottlenecks.

---

## ⚡ Performance Optimization Strategy (CO4 - BT4)

1. **`React.memo`**:
   - Applied to `PostCard` and `MemoizedDayCell`. Prevents re-rendering 42 calendar grid cells when dragging or editing a single post.
2. **`useMemo`**:
   - Caches expensive date range grid computations (`getMonthGrid`, `getWeekDays`).
   - Caches filtered post mappings by date and time slot (`postsByDate`, `postsByTimeSlot`).
   - Caches KPI analytics aggregation in `StatsHeader`.
3. **`useCallback`**:
   - Stabilizes function references for drag-over and drop event handlers passed into list items.

---

## 🧪 Testing Suite (CO5 - BT5)

The project includes unit and integration tests powered by **Vitest** + **React Testing Library**:

- `postsSlice.test.js`: Verifies Redux Toolkit actions (CRUD, drag-and-drop rescheduling, status updates).
- `CalendarView.test.jsx`: Integration test verifying navigation, view mode switching, platform filtering, and modal triggers.
- `PostCard.test.jsx`: Component unit test verifying dragstart payloads, click callbacks, and badge formatting.
- `PerformanceOptimization.test.jsx`: Verifies `React.memo` prevents re-rendering when props remain identical.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
cd exp4
npm install
```

### Running Locally
```bash
npm run dev
```

### Running Test Suite
```bash
npm test
```
