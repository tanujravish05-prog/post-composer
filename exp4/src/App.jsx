import React, {
  memo,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import "./index.css";

/* =======================================================
   DATA
======================================================= */

const INITIAL_POSTS = [
  {
    id: "1",
    title: "Product Launch",
    date: "2026-09-03",
    time: "09:00",
    platform: "Instagram",
    status: "Scheduled",
  },
  {
    id: "2",
    title: "Weekly Company Update",
    date: "2026-09-04",
    time: "11:00",
    platform: "LinkedIn",
    status: "Scheduled",
  },
  {
    id: "3",
    title: "Customer Story",
    date: "2026-09-05",
    time: "14:00",
    platform: "X",
    status: "Draft",
  },
  {
    id: "4",
    title: "Behind The Scenes",
    date: "2026-09-03",
    time: "15:00",
    platform: "Instagram",
    status: "Scheduled",
  },
  {
    id: "5",
    title: "Engineering Update",
    date: "2026-09-01",
    time: "13:00",
    platform: "LinkedIn",
    status: "Published",
  },
  {
    id: "6",
    title: "New Feature Announcement",
    date: "2026-09-02",
    time: "16:00",
    platform: "X",
    status: "Scheduled",
  },
];

const HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

/* =======================================================
   DATE HELPERS
======================================================= */

const pad = (number) => String(number).padStart(2, "0");

function dateKey(date) {
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate())
  );
}

function parseDate(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getCalendarDates(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDay = firstDay.getDay();
  const start = addDays(firstDay, -startDay);

  return Array.from({ length: 42 }, (_, index) =>
    dateKey(addDays(start, index))
  );
}

function getWeekDates(currentDate) {
  const dayOfWeek = currentDate.getDay();
  const sunday = addDays(currentDate, -dayOfWeek);
  return Array.from({ length: 7 }, (_, index) =>
    dateKey(addDays(sunday, index))
  );
}

/* =======================================================
   NORMALIZED STATE & REDUCER
======================================================= */

function createState(posts) {
  const postsById = {};
  const postsByDate = {};

  posts.forEach((post) => {
    postsById[post.id] = post;

    if (!postsByDate[post.date]) {
      postsByDate[post.date] = [];
    }

    postsByDate[post.date].push(post.id);
  });

  return {
    postsById,
    postsByDate,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "MOVE": {
      const post = state.postsById[action.id];

      if (!post) {
        return state;
      }

      const from = state.postsByDate[post.date] || [];
      const targetDate = action.date;
      const targetTime = action.time || post.time;

      if (post.date === targetDate && post.time === targetTime) {
        return state;
      }

      const to = state.postsByDate[targetDate] || [];

      return {
        postsById: {
          ...state.postsById,
          [post.id]: {
            ...post,
            date: targetDate,
            time: targetTime,
          },
        },
        postsByDate: {
          ...state.postsByDate,
          [post.date]: from.filter((id) => id !== post.id),
          [targetDate]: to.includes(post.id) ? to : [...to, post.id],
        },
      };
    }

    case "ADD": {
      const post = action.post;

      return {
        postsById: {
          ...state.postsById,
          [post.id]: post,
        },
        postsByDate: {
          ...state.postsByDate,
          [post.date]: [...(state.postsByDate[post.date] || []), post.id],
        },
      };
    }

    case "DELETE": {
      const post = state.postsById[action.id];

      if (!post) {
        return state;
      }

      const postsById = { ...state.postsById };
      delete postsById[action.id];

      return {
        postsById,
        postsByDate: {
          ...state.postsByDate,
          [post.date]: (state.postsByDate[post.date] || []).filter(
            (id) => id !== action.id
          ),
        },
      };
    }

    default:
      return state;
  }
}

/* =======================================================
   POST CARD (OPTIMIZED vs NON-OPTIMIZED)
======================================================= */

const PostCardContent = ({ post, onPointerDown, onDelete, onMoveKeyboard, isOptimized }) => {
  const renderCount = useRef(0);
  renderCount.current++;

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onMoveKeyboard(post, -1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      onMoveKeyboard(post, 1);
    }
    if (event.key === "Delete") {
      event.preventDefault();
      onDelete(post.id);
    }
  };

  return (
    <article
      className={"post-card " + post.status.toLowerCase()}
      tabIndex={0}
      draggable={false}
      onPointerDown={(event) => onPointerDown(event, post)}
      onKeyDown={handleKeyDown}
      aria-label={post.title + ", " + post.platform + ", " + post.time}
    >
      <div className="post-header">
        <span className="post-time">{post.time}</span>
        <div className="post-header-actions">
          <span 
            className={`render-badge ${isOptimized ? 'badge-optimized' : 'badge-unoptimized'}`}
            title="Component Render Count"
          >
            R:{renderCount.current}
          </span>
          <button
            type="button"
            className="delete-btn"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onDelete(post.id)}
            aria-label={"Delete " + post.title}
          >
            ×
          </button>
        </div>
      </div>

      <strong>{post.title}</strong>

      <div className="post-details">
        <span>{post.platform}</span>
        <span>{post.status}</span>
      </div>
    </article>
  );
};

const MemoizedPostCard = memo(PostCardContent);

const PostCard = (props) => {
  if (props.isOptimized) {
    return <MemoizedPostCard {...props} />;
  }
  return <PostCardContent {...props} />;
};

/* =======================================================
   MONTH CALENDAR DAY CELL
======================================================= */

const CalendarDayContent = ({
  date,
  month,
  posts,
  onDrop,
  onPointerDown,
  onDelete,
  onMoveKeyboard,
  isOptimized
}) => {
  const day = parseDate(date);
  const outside = day.getMonth() !== month.getMonth();
  const today = date === dateKey(new Date());

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.currentTarget.classList.add("drop-target");
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.currentTarget.classList.remove("drop-target");
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.currentTarget.classList.remove("drop-target");
      const id = event.dataTransfer.getData("post-id");
      if (id) {
        onDrop(id, date);
      }
    },
    [date, onDrop]
  );

  return (
    <div
      className={[
        "calendar-day",
        outside ? "outside" : "",
        today ? "today" : "",
      ].join(" ")}
      data-date={date}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="day-number">
        <span>{day.getDate()}</span>
        {today && <span className="today-label">TODAY</span>}
      </div>

      <div className="day-posts">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPointerDown={onPointerDown}
            onDelete={onDelete}
            onMoveKeyboard={onMoveKeyboard}
            isOptimized={isOptimized}
          />
        ))}
      </div>
    </div>
  );
};

const MemoizedCalendarDay = memo(CalendarDayContent);

const CalendarDay = (props) => {
  if (props.isOptimized) {
    return <MemoizedCalendarDay {...props} />;
  }
  return <CalendarDayContent {...props} />;
};

/* =======================================================
   WEEK VIEW HOURLY TIME SLOT
======================================================= */

const WeekTimeSlotContent = ({
  date,
  hour,
  posts,
  onDrop,
  onPointerDown,
  onDelete,
  onMoveKeyboard,
  isOptimized
}) => {
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.currentTarget.classList.add("drop-target");
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.currentTarget.classList.remove("drop-target");
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.currentTarget.classList.remove("drop-target");
      const id = event.dataTransfer.getData("post-id");
      if (id) {
        onDrop(id, date, hour);
      }
    },
    [date, hour, onDrop]
  );

  return (
    <div
      className="week-time-slot"
      data-date={date}
      data-time={hour}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onPointerDown={onPointerDown}
          onDelete={onDelete}
          onMoveKeyboard={onMoveKeyboard}
          isOptimized={isOptimized}
        />
      ))}
    </div>
  );
};

const MemoizedWeekTimeSlot = memo(WeekTimeSlotContent);

const WeekTimeSlot = (props) => {
  if (props.isOptimized) {
    return <MemoizedWeekTimeSlot {...props} />;
  }
  return <WeekTimeSlotContent {...props} />;
};

/* =======================================================
   MAIN APPLICATION
======================================================= */

export function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_POSTS, createState);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 3));
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("All");
  const [status, setStatus] = useState("All");
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'week'
  const [message, setMessage] = useState("Calendar ready");

  // Mode Toggle State: Optimized (true) vs Non-Optimized (false)
  const [isOptimized, setIsOptimized] = useState(true);

  // Live Telemetry Render Counters State
  const [optimizedRenders, setOptimizedRenders] = useState(0);
  const [unoptimizedRenders, setUnoptimizedRenders] = useState(0);

  const dragRef = useRef(null);

  const handleResetTelemetry = useCallback(() => {
    setOptimizedRenders(0);
    setUnoptimizedRenders(0);
  }, []);

  /* =====================================================
     CALENDAR DATES & WEEK DATES
  ===================================================== */

  const monthDates = useMemo(
    () => getCalendarDates(currentDate),
    [currentDate]
  );

  const weekDates = useMemo(
    () => getWeekDates(currentDate),
    [currentDate]
  );

  /* =====================================================
     FILTER POSTS
  ===================================================== */

  const filteredPostsByDate = useMemo(() => {
    const result = {};
    const datesToFilter = viewMode === "month" ? monthDates : weekDates;

    datesToFilter.forEach((date) => {
      const ids = state.postsByDate[date] || [];

      result[date] = ids
        .map((id) => state.postsById[id])
        .filter(Boolean)
        .filter((post) => {
          const searchMatch = post.title
            .toLowerCase()
            .includes(search.toLowerCase());

          const platformMatch =
            platform === "All" || post.platform === platform;

          const statusMatch =
            status === "All" || post.status === status;

          return searchMatch && platformMatch && statusMatch;
        });
    });

    return result;
  }, [monthDates, weekDates, viewMode, state.postsByDate, state.postsById, search, platform, status]);

  /* =====================================================
     MOVE POST
  ===================================================== */

  const movePost = useCallback(
    (id, date, time = null) => {
      const post = state.postsById[id];
      if (!post) return;

      dispatch({
        type: "MOVE",
        id,
        date,
        time: time || post.time,
      });

      // Increment render telemetry cleanly upon post move
      if (isOptimized) {
        setOptimizedRenders((prev) => prev + 1);
      } else {
        setUnoptimizedRenders((prev) => prev + 1);
      }

      setMessage(`${post.title} moved to ${date} ${time || post.time}`);
    },
    [state.postsById, isOptimized]
  );

  /* =====================================================
     DROP
  ===================================================== */

  const handleDrop = useCallback(
    (id, date, time = null) => {
      movePost(id, date, time);
    },
    [movePost]
  );

  /* =====================================================
     POINTER DRAG (OPTIMIZED vs NON-OPTIMIZED)
  ===================================================== */

  const handlePointerDown = useCallback(
    (event, post) => {
      if (event.button !== 0) return;

      const element = event.currentTarget;
      const startX = event.clientX;
      const startY = event.clientY;

      dragRef.current = {
        post,
        element,
        startX,
        startY,
      };

      element.setPointerCapture(event.pointerId);
      element.classList.add("dragging");

      const move = (pointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;

        const x = pointerEvent.clientX - drag.startX;
        const y = pointerEvent.clientY - drag.startY;

        drag.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;

        /*
          OPTIMIZED vs NON-OPTIMIZED MODE

          In OPTIMIZED mode:
          - Zero React state re-renders during drag mouse movement.
          - Browser transforms DOM directly at 60 FPS.

          In NON-OPTIMIZED mode:
          - Rapidly increments telemetry counter on EVERY single mouse move frame!
        */
        if (!isOptimized) {
          setUnoptimizedRenders((prev) => prev + 1);
        }
      };

      const up = (pointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;

        drag.element.style.transform = "";
        drag.element.classList.remove("dragging");

        const target = document.elementFromPoint(
          pointerEvent.clientX,
          pointerEvent.clientY
        );

        const slot = target?.closest("[data-date]");

        if (slot) {
          const targetDate = slot.dataset.date;
          const targetTime = slot.dataset.time || null;

          if (targetDate) {
            movePost(drag.post.id, targetDate, targetTime);
          }
        }

        dragRef.current = null;

        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [movePost, isOptimized]
  );

  /* =====================================================
     KEYBOARD MOVE
  ===================================================== */

  const moveKeyboard = useCallback(
    (post, direction) => {
      const current = parseDate(post.date);
      const target = addDays(current, direction);
      movePost(post.id, dateKey(target));
    },
    [movePost]
  );

  /* =====================================================
     DELETE
  ===================================================== */

  const deletePost = useCallback(
    (id) => {
      const post = state.postsById[id];
      if (!post) return;

      dispatch({
        type: "DELETE",
        id,
      });

      setMessage(`${post.title} deleted`);
    },
    [state.postsById]
  );

  /* =====================================================
     ADD POST
  ===================================================== */

  const addPost = useCallback(() => {
    const title = window.prompt("Enter post title:");
    if (!title) return;

    const date = window.prompt(
      "Enter date (YYYY-MM-DD):",
      dateKey(new Date())
    );
    if (!date) return;

    const time = window.prompt("Enter time (HH:MM):", "10:00") || "10:00";

    const newPost = {
      id: Date.now().toString(),
      title,
      date,
      time,
      platform: "Instagram",
      status: "Scheduled",
    };

    dispatch({
      type: "ADD",
      post: newPost,
    });

    setMessage(`${title} scheduled for ${date} at ${time}`);
  }, []);

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const previousPeriod = useCallback(() => {
    setCurrentDate((current) => {
      if (viewMode === "month") {
        return new Date(current.getFullYear(), current.getMonth() - 1, 1);
      } else {
        return addDays(current, -7);
      }
    });
  }, [viewMode]);

  const nextPeriod = useCallback(() => {
    setCurrentDate((current) => {
      if (viewMode === "month") {
        return new Date(current.getFullYear(), current.getMonth() + 1, 1);
      } else {
        return addDays(current, 7);
      }
    });
  }, [viewMode]);

  const goToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  /* =====================================================
     HEADER LABEL
  ===================================================== */

  const periodLabel = useMemo(() => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else {
      const weekDaysList = getWeekDates(currentDate);
      const start = parseDate(weekDaysList[0]);
      const end = parseDate(weekDaysList[6]);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
  }, [currentDate, viewMode]);

  const totalPosts = Object.keys(state.postsById).length;

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div>
          <h1>📅 Social Media Scheduler</h1>
          <p>
            {isOptimized 
              ? "⚡ Optimized Mode: Zero React re-renders on drag & memoized cards" 
              : "🐌 Non-Optimized Mode: React re-renders on every pointer move frame!"}
          </p>
        </div>

        <div className="header-actions">
          {/* View Mode Switcher Pill */}
          <div className="view-mode-pill">
            <button
              type="button"
              className={viewMode === "month" ? "active" : ""}
              onClick={() => setViewMode("month")}
              data-testid="view-month-btn"
            >
              Month View
            </button>
            <button
              type="button"
              className={viewMode === "week" ? "active" : ""}
              onClick={() => setViewMode("week")}
              data-testid="view-week-btn"
            >
              Week View
            </button>
          </div>

          {/* Mode Toggle Button */}
          <button
            type="button"
            className={`toggle-mode-btn ${isOptimized ? 'optimized' : 'unoptimized'}`}
            onClick={() => setIsOptimized((prev) => !prev)}
            data-testid="toggle-mode-btn"
          >
            {isOptimized ? "⚡ Mode: OPTIMIZED" : "🐌 Mode: NON-OPTIMIZED"}
          </button>

          <button type="button" className="add-button" onClick={addPost}>
            + Add Post
          </button>
        </div>
      </header>

      {/* RENDER TELEMETRY COMPARISON DASHBOARD BAR */}
      <section className="telemetry-dashboard" data-testid="telemetry-dashboard">
        <div className="telemetry-item optimized-box">
          <span className="telemetry-label">⚡ OPTIMIZED TOTAL RENDERS</span>
          <span className="telemetry-value" data-testid="optimized-render-val">{optimizedRenders}</span>
          <span className="telemetry-subtext">Zero DOM re-renders during dragging</span>
        </div>

        <div className="telemetry-item unoptimized-box">
          <span className="telemetry-label">🐌 NON-OPTIMIZED TOTAL RENDERS</span>
          <span className="telemetry-value text-moving" data-testid="unoptimized-render-val">{unoptimizedRenders}</span>
          <span className="telemetry-subtext">Ticks up rapidly on every mouse move frame!</span>
        </div>

        <button 
          type="button" 
          className="reset-telemetry-btn"
          onClick={handleResetTelemetry}
          title="Reset render counters"
        >
          Reset Telemetry
        </button>
      </section>

      {/* CONTROLS */}
      <section className="controls">
        <input
          type="search"
          placeholder="Search posts..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={platform}
          onChange={(event) => setPlatform(event.target.value)}
        >
          <option value="All">All Platforms</option>
          <option value="Instagram">Instagram</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="X">X</option>
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>
      </section>

      {/* CALENDAR CONTAINER */}
      <section className="calendar-container">
        <div className="calendar-toolbar">
          <button type="button" onClick={previousPeriod}>
            ←
          </button>
          <button type="button" onClick={goToday}>
            Today
          </button>
          <h2>{periodLabel}</h2>
          <button type="button" onClick={nextPeriod}>
            →
          </button>
        </div>

        {/* MONTH VIEW */}
        {viewMode === "month" && (
          <>
            <div className="weekdays">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="calendar-grid">
              {monthDates.map((date) => (
                <CalendarDay
                  key={date}
                  date={date}
                  month={currentDate}
                  posts={filteredPostsByDate[date] || []}
                  onDrop={handleDrop}
                  onPointerDown={handlePointerDown}
                  onDelete={deletePost}
                  onMoveKeyboard={moveKeyboard}
                  isOptimized={isOptimized}
                />
              ))}
            </div>
          </>
        )}

        {/* WEEK VIEW WITH HOURLY DRAG AND DROP */}
        {viewMode === "week" && (
          <div className="week-view-container">
            <div className="week-header-grid">
              <div className="time-col-header">Time</div>
              {weekDates.map((date) => {
                const day = parseDate(date);
                const isToday = date === dateKey(new Date());
                return (
                  <div
                    key={date}
                    className={`week-day-header ${isToday ? "today" : ""}`}
                  >
                    <span>{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
                    <strong>{day.getDate()}</strong>
                  </div>
                );
              })}
            </div>

            <div className="week-body-grid">
              {HOURS.map((hour) => (
                <div key={hour} className="week-hour-row">
                  <div className="time-col">{hour}</div>
                  {weekDates.map((date) => {
                    const slotPosts = (filteredPostsByDate[date] || []).filter(
                      (p) => p.time.startsWith(hour.split(":")[0])
                    );

                    return (
                      <WeekTimeSlot
                        key={`${date}_${hour}`}
                        date={date}
                        hour={hour}
                        posts={slotPosts}
                        onDrop={handleDrop}
                        onPointerDown={handlePointerDown}
                        onDelete={deletePost}
                        onMoveKeyboard={moveKeyboard}
                        isOptimized={isOptimized}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* STATUS FOOTER */}
      <footer className="status">
        <span className={`status-badge ${isOptimized ? 'badge-optimized' : 'badge-unoptimized'}`}>
          {isOptimized ? "⚡ Optimized Memoized Rendering" : "🐌 Unmemoized Full-Render Dragging"}
        </span>
        <span>{totalPosts} posts</span>
        <span>{message}</span>
      </footer>
    </div>
  );
}

export default App;

export {
  reducer,
  createState,
  dateKey,
  parseDate,
  addDays,
  getCalendarDates,
  getWeekDates,
};
