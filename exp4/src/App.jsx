import React, {
  memo,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import "./styles.css";

/* =========================================================
   DATE HELPERS
========================================================= */

const pad = (n) => String(n).padStart(2, "0");

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
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

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfCalendar(date) {
  const first = startOfMonth(date);
  const day = first.getDay();

  return addDays(first, -day);
}

function getCalendarDates(month) {
  const start = startOfCalendar(month);

  return Array.from({ length: 42 }, (_, index) =>
    dateKey(addDays(start, index))
  );
}

/* =========================================================
   SAMPLE DATA
========================================================= */

const initialPosts = [
  {
    id: "1",
    title: "Product launch",
    date: "2026-09-03",
    time: "09:00",
    platform: "Instagram",
    status: "scheduled",
  },
  {
    id: "2",
    title: "Weekly company update",
    date: "2026-09-04",
    time: "11:00",
    platform: "LinkedIn",
    status: "scheduled",
  },
  {
    id: "3",
    title: "Customer story",
    date: "2026-09-05",
    time: "14:30",
    platform: "X",
    status: "draft",
  },
  {
    id: "4",
    title: "Behind the scenes",
    date: "2026-09-08",
    time: "10:30",
    platform: "Instagram",
    status: "scheduled",
  },
  {
    id: "5",
    title: "Engineering update",
    date: "2026-09-10",
    time: "13:00",
    platform: "LinkedIn",
    status: "published",
  },
  {
    id: "6",
    title: "New feature announcement",
    date: "2026-09-12",
    time: "16:00",
    platform: "X",
    status: "scheduled",
  },
];

/* =========================================================
   NORMALIZE DATA
========================================================= */

function createInitialState(posts) {
  const postsById = {};
  const postsByDate = {};

  for (const post of posts) {
    postsById[post.id] = post;

    if (!postsByDate[post.date]) {
      postsByDate[post.date] = [];
    }

    postsByDate[post.date].push(post.id);
  }

  return {
    postsById,
    postsByDate,
  };
}

/* =========================================================
   REDUCER
========================================================= */

function calendarReducer(state, action) {
  switch (action.type) {
    case "MOVE_POST": {
      const { postId, fromDate, toDate } = action;

      if (fromDate === toDate) {
        return state;
      }

      const post = state.postsById[postId];

      if (!post) {
        return state;
      }

      const oldDatePosts = state.postsByDate[fromDate] || [];
      const newDatePosts = state.postsByDate[toDate] || [];

      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            ...post,
            date: toDate,
          },
        },
        postsByDate: {
          ...state.postsByDate,
          [fromDate]: oldDatePosts.filter((id) => id !== postId),
          [toDate]: [...newDatePosts, postId],
        },
      };
    }

    case "ADD_POST": {
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

    case "DELETE_POST": {
      const post = state.postsById[action.postId];

      if (!post) {
        return state;
      }

      const copy = { ...state.postsById };
      delete copy[action.postId];

      return {
        postsById: copy,
        postsByDate: {
          ...state.postsByDate,
          [post.date]: (state.postsByDate[post.date] || []).filter(
            (id) => id !== action.postId
          ),
        },
      };
    }

    default:
      return state;
  }
}

/* =========================================================
   PERFORMANCE COUNTER
========================================================= */

const renderCounts = {};

function trackRender(id) {
  renderCounts[id] = (renderCounts[id] || 0) + 1;
}

/* =========================================================
   POST CARD
========================================================= */

const PostCard = memo(function PostCard({
  post,
  onPointerDown,
  onKeyboardMove,
  onDelete,
}) {
  trackRender(`post-${post.id}`);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onKeyboardMove(post, -1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      onKeyboardMove(post, 1);
    }

    if (event.key === "Delete") {
      event.preventDefault();
      onDelete(post.id);
    }
  };

  return (
    <article
      className={`post-card ${post.status}`}
      tabIndex={0}
      role="button"
      aria-label={`${post.title}, ${post.time}, ${post.platform}`}
      onPointerDown={(event) => onPointerDown(event, post)}
      onKeyDown={handleKeyDown}
    >
      <div className="post-top">
        <span className="post-time">{post.time}</span>

        <button
          type="button"
          className="delete-button"
          aria-label={`Delete ${post.title}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onDelete(post.id)}
        >
          ×
        </button>
      </div>

      <strong>{post.title}</strong>

      <div className="post-meta">
        <span>{post.platform}</span>
        <span>{post.status}</span>
      </div>
    </article>
  );
});

/* =========================================================
   CALENDAR DAY
========================================================= */

const CalendarDay = memo(function CalendarDay({
  date,
  currentMonth,
  postIds,
  postsById,
  onDrop,
  onPointerDown,
  onKeyboardMove,
  onDelete,
}) {
  trackRender(`day-${date}`);

  const parsed = parseDate(date);
  const isToday = date === dateKey(new Date());
  const outsideMonth = parsed.getMonth() !== currentMonth;

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();

      const postId = event.dataTransfer.getData("post-id");

      if (postId) {
        onDrop(postId, date);
      }
    },
    [date, onDrop]
  );

  return (
    <section
      className={[
        "calendar-day",
        outsideMonth ? "outside-month" : "",
        isToday ? "today" : "",
      ].join(" ")}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      aria-label={`Calendar day ${date}`}
    >
      <header className="day-header">
        <span>{parsed.getDate()}</span>
        {isToday && <small>Today</small>}
      </header>

      <div className="posts">
        {postIds.map((id) => {
          const post = postsById[id];

          if (!post) {
            return null;
          }

          return (
            <PostCard
              key={post.id}
              post={post}
              onPointerDown={onPointerDown}
              onKeyboardMove={onKeyboardMove}
              onDelete={onDelete}
            />
          );
        })}
      </div>
    </section>
  );
});

/* =========================================================
   CALENDAR
========================================================= */

export function Calendar() {
  const [state, dispatch] = useReducer(
    calendarReducer,
    initialPosts,
    createInitialState
  );

  const [month, setMonth] = useState(new Date(2026, 8, 1));
  const [dragging, setDragging] = useState(null);
  const [announcement, setAnnouncement] = useState("");

  const dragRef = useRef(null);

  /* -------------------------------------------------------
     CALENDAR DATES
  ------------------------------------------------------- */

  const calendarDates = useMemo(
    () => getCalendarDates(month),
    [month]
  );

  /* -------------------------------------------------------
     MOVE POST
  ------------------------------------------------------- */

  const movePost = useCallback((post, toDate) => {
    const fromDate = post.date;

    if (fromDate === toDate) {
      return;
    }

    dispatch({
      type: "MOVE_POST",
      postId: post.id,
      fromDate,
      toDate,
    });

    setAnnouncement(`${post.title} moved to ${toDate}`);
  }, []);

  /* -------------------------------------------------------
     DRAG START
  ------------------------------------------------------- */

  const handlePointerDown = useCallback(
    (event, post) => {
      if (event.button !== 0) {
        return;
      }

      const element = event.currentTarget;

      dragRef.current = {
        post,
        startX: event.clientX,
        startY: event.clientY,
        element,
        fromDate: post.date,
      };

      element.setPointerCapture(event.pointerId);
      setDragging(post);

      const move = (e) => {
        const drag = dragRef.current;
        if (!drag) return;

        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;

        drag.element.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        drag.element.style.zIndex = "1000";
      };

      const up = (e) => {
        const drag = dragRef.current;
        if (!drag) return;

        drag.element.style.transform = "";
        drag.element.style.zIndex = "";

        const target = document.elementFromPoint(e.clientX, e.clientY);
        const dayElement = target?.closest("[data-calendar-date]");

        if (dayElement) {
          const targetDate = dayElement.dataset.calendarDate;

          if (targetDate && targetDate !== drag.fromDate) {
            movePost(drag.post, targetDate);
          }
        }

        dragRef.current = null;
        setDragging(null);

        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [movePost]
  );

  /* -------------------------------------------------------
     DROP
  ------------------------------------------------------- */

  const handleDrop = useCallback(
    (postId, date) => {
      const post = state.postsById[postId];
      if (!post) return;
      movePost(post, date);
    },
    [state.postsById, movePost]
  );

  /* -------------------------------------------------------
     KEYBOARD MOVE
  ------------------------------------------------------- */

  const handleKeyboardMove = useCallback(
    (post, direction) => {
      const current = parseDate(post.date);
      const target = addDays(current, direction);
      const targetDate = dateKey(target);

      movePost(post, targetDate);
    },
    [movePost]
  );

  /* -------------------------------------------------------
     DELETE
  ------------------------------------------------------- */

  const handleDelete = useCallback(
    (id) => {
      const post = state.postsById[id];
      if (!post) return;

      dispatch({
        type: "DELETE_POST",
        postId: id,
      });

      setAnnouncement(`${post.title} deleted`);
    },
    [state.postsById]
  );

  /* -------------------------------------------------------
     NAVIGATION
  ------------------------------------------------------- */

  const previousMonth = useCallback(() => {
    setMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1));
  }, []);

  const today = useCallback(() => {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  /* -------------------------------------------------------
     MONTH LABEL
  ------------------------------------------------------- */

  const monthLabel = useMemo(
    () =>
      month.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [month]
  );

  return (
    <main className="calendar-app">
      <div className="calendar-toolbar">
        <div>
          <h1>Scheduled Posts</h1>
          <p>
            Drag posts between dates or use ← → on a selected post.
          </p>
        </div>

        <div className="toolbar-actions">
          <button type="button" onClick={previousMonth}>
            ←
          </button>

          <button type="button" onClick={today}>
            Today
          </button>

          <strong>{monthLabel}</strong>

          <button type="button" onClick={nextMonth}>
            →
          </button>
        </div>
      </div>

      <div className="calendar-grid" role="grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div className="weekday" key={day}>
            {day}
          </div>
        ))}

        {calendarDates.map((date) => (
          <div
            key={date}
            data-calendar-date={date}
            className="calendar-cell"
          >
            <CalendarDay
              date={date}
              currentMonth={month.getMonth()}
              postIds={state.postsByDate[date] || []}
              postsById={state.postsById}
              onDrop={handleDrop}
              onPointerDown={handlePointerDown}
              onKeyboardMove={handleKeyboardMove}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>

      <div className="calendar-footer" aria-live="polite">
        {dragging
          ? `Moving ${dragging.title}…`
          : announcement || "Calendar ready"}
      </div>
    </main>
  );
}

export default Calendar;
