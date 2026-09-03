import React, {
  memo,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import "./index.css";

/*
=========================================================
 SOCIAL MEDIA SCHEDULER
 Single-file optimized calendar

 Features:
 - Month calendar
 - Scheduled posts
 - Drag & drop
 - Pointer based dragging
 - Keyboard movement
 - Add posts
 - Delete posts
 - Search/filter
 - Platform filter
 - Status filter
 - Optimistic local update
 - Normalized state
 - React.memo
 - useMemo
 - useCallback
 - Minimal re-rendering
 - Render monitoring
 - Responsive UI
=========================================================
*/


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
    time: "14:30",
    platform: "X",
    status: "Draft",
  },
  {
    id: "4",
    title: "Behind The Scenes",
    date: "2026-09-08",
    time: "10:30",
    platform: "Instagram",
    status: "Scheduled",
  },
  {
    id: "5",
    title: "Engineering Update",
    date: "2026-09-10",
    time: "13:00",
    platform: "LinkedIn",
    status: "Published",
  },
  {
    id: "6",
    title: "New Feature Announcement",
    date: "2026-09-12",
    time: "16:00",
    platform: "X",
    status: "Scheduled",
  },
];


/* =======================================================
   DATE HELPERS
======================================================= */

const pad = (number) =>
  String(number).padStart(2, "0");


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
  const [year, month, day] =
    key.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}


function addDays(date, amount) {
  const result = new Date(date);

  result.setDate(
    result.getDate() + amount
  );

  return result;
}


function getCalendarDates(month) {
  const firstDay = new Date(
    month.getFullYear(),
    month.getMonth(),
    1
  );

  const startDay = firstDay.getDay();

  const start = addDays(
    firstDay,
    -startDay
  );

  return Array.from(
    { length: 42 },
    (_, index) =>
      dateKey(
        addDays(start, index)
      )
  );
}


/* =======================================================
   NORMALIZED STATE
======================================================= */

function createState(posts) {
  const postsById = {};
  const postsByDate = {};

  posts.forEach((post) => {
    postsById[post.id] = post;

    if (!postsByDate[post.date]) {
      postsByDate[post.date] = [];
    }

    postsByDate[post.date].push(
      post.id
    );
  });

  return {
    postsById,
    postsByDate,
  };
}


/* =======================================================
   REDUCER
======================================================= */

function reducer(state, action) {
  switch (action.type) {

    case "MOVE": {
      const post =
        state.postsById[action.id];

      if (!post) {
        return state;
      }

      const from =
        state.postsByDate[post.date] || [];

      const to =
        state.postsByDate[action.date] || [];

      if (post.date === action.date) {
        return state;
      }

      return {
        postsById: {
          ...state.postsById,

          [post.id]: {
            ...post,
            date: action.date,
            time:
              action.time || post.time,
          },
        },

        postsByDate: {
          ...state.postsByDate,

          [post.date]: from.filter(
            (id) => id !== post.id
          ),

          [action.date]: [
            ...to,
            post.id,
          ],
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

          [post.date]: [
            ...(state.postsByDate[
              post.date
            ] || []),
            post.id,
          ],
        },
      };
    }


    case "DELETE": {
      const post =
        state.postsById[action.id];

      if (!post) {
        return state;
      }

      const postsById = {
        ...state.postsById,
      };

      delete postsById[action.id];

      return {
        postsById,

        postsByDate: {
          ...state.postsByDate,

          [post.date]: (
            state.postsByDate[
              post.date
            ] || []
          ).filter(
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
   POST CARD
======================================================= */

const PostCard = memo(function PostCard({
  post,
  onPointerDown,
  onDelete,
  onMoveKeyboard,
}) {

  const renderCount = useRef(0);

  renderCount.current++;

  const handleKeyDown = (event) => {

    if (event.key === "ArrowLeft") {
      event.preventDefault();

      onMoveKeyboard(
        post,
        -1
      );
    }


    if (event.key === "ArrowRight") {
      event.preventDefault();

      onMoveKeyboard(
        post,
        1
      );
    }


    if (event.key === "Delete") {
      event.preventDefault();

      onDelete(post.id);
    }
  };


  return (
    <article
      className={
        "post-card " +
        post.status.toLowerCase()
      }

      tabIndex={0}

      draggable={false}

      onPointerDown={(event) =>
        onPointerDown(
          event,
          post
        )
      }

      onKeyDown={handleKeyDown}

      aria-label={
        post.title +
        ", " +
        post.platform +
        ", " +
        post.time
      }
    >

      <div className="post-header">

        <span className="post-time">
          {post.time}
        </span>

        <button
          type="button"
          className="delete-btn"

          onPointerDown={(event) =>
            event.stopPropagation()
          }

          onClick={() =>
            onDelete(post.id)
          }

          aria-label={
            "Delete " +
            post.title
          }
        >
          ×
        </button>

      </div>


      <strong>
        {post.title}
      </strong>


      <div className="post-details">

        <span>
          {post.platform}
        </span>

        <span>
          {post.status}
        </span>

      </div>

    </article>
  );
});


/* =======================================================
   CALENDAR DAY
======================================================= */

const CalendarDay = memo(function CalendarDay({
  date,
  month,
  posts,
  onDrop,
  onPointerDown,
  onDelete,
  onMoveKeyboard,
}) {

  const day = parseDate(date);

  const outside =
    day.getMonth() !==
    month.getMonth();

  const today =
    date === dateKey(
      new Date()
    );


  const handleDragOver = useCallback(
    (event) => {
      event.preventDefault();

      event.currentTarget.classList.add(
        "drop-target"
      );
    },
    []
  );


  const handleDragLeave = useCallback(
    (event) => {
      event.currentTarget.classList.remove(
        "drop-target"
      );
    },
    []
  );


  const handleDrop = useCallback(
    (event) => {

      event.preventDefault();

      event.currentTarget.classList.remove(
        "drop-target"
      );

      const id =
        event.dataTransfer.getData(
          "post-id"
        );

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

        outside
          ? "outside"
          : "",

        today
          ? "today"
          : "",
      ].join(" ")}

      data-date={date}

      onDragOver={handleDragOver}

      onDragLeave={handleDragLeave}

      onDrop={handleDrop}
    >

      <div className="day-number">

        {day.getDate()}

        {today && (
          <span>
            TODAY
          </span>
        )}

      </div>


      <div className="day-posts">

        {posts.map((post) => (

          <PostCard
            key={post.id}
            post={post}
            onPointerDown={
              onPointerDown
            }
            onDelete={
              onDelete
            }
            onMoveKeyboard={
              onMoveKeyboard
            }
          />

        ))}

      </div>

    </div>
  );
});


/* =======================================================
   MAIN APPLICATION
======================================================= */

export function App() {

  const [state, dispatch] =
    useReducer(
      reducer,
      INITIAL_POSTS,
      createState
    );


  const [month, setMonth] =
    useState(
      new Date(
        2026,
        8,
        1
      )
    );


  const [search, setSearch] =
    useState("");


  const [platform, setPlatform] =
    useState("All");


  const [status, setStatus] =
    useState("All");


  const [message, setMessage] =
    useState(
      "Calendar ready"
    );


  const dragRef =
    useRef(null);


  /* =====================================================
     CALENDAR DATES
  ===================================================== */

  const dates = useMemo(
    () =>
      getCalendarDates(
        month
      ),
    [month]
  );


  /* =====================================================
     FILTER POSTS
  ===================================================== */

  const filteredPostsByDate =
    useMemo(() => {

      const result = {};

      dates.forEach((date) => {

        const ids =
          state.postsByDate[
            date
          ] || [];


        result[date] =
          ids
            .map(
              (id) =>
                state.postsById[id]
            )

            .filter(Boolean)

            .filter((post) => {

              const searchMatch =
                post.title
                  .toLowerCase()
                  .includes(
                    search.toLowerCase()
                  );


              const platformMatch =
                platform === "All" ||
                post.platform ===
                  platform;


              const statusMatch =
                status === "All" ||
                post.status ===
                  status;


              return (
                searchMatch &&
                platformMatch &&
                statusMatch
              );
            });

      });

      return result;

    }, [
      dates,
      state.postsByDate,
      state.postsById,
      search,
      platform,
      status,
    ]);


  /* =====================================================
     MOVE POST
  ===================================================== */

  const movePost = useCallback(
    (id, date) => {

      const post =
        state.postsById[id];

      if (!post) {
        return;
      }


      dispatch({
        type: "MOVE",

        id,

        date,
      });


      setMessage(
        `${post.title} moved to ${date}`
      );

    },
    [
      state.postsById,
    ]
  );


  /* =====================================================
     DROP
  ===================================================== */

  const handleDrop =
    useCallback(
      (id, date) => {

        movePost(
          id,
          date
        );

      },
      [movePost]
    );


  /* =====================================================
     POINTER DRAG
  ===================================================== */

  const handlePointerDown =
    useCallback(
      (
        event,
        post
      ) => {

        if (
          event.button !== 0
        ) {
          return;
        }


        const element =
          event.currentTarget;


        const startX =
          event.clientX;

        const startY =
          event.clientY;


        dragRef.current = {
          post,
          element,
          startX,
          startY,
        };


        element.setPointerCapture(
          event.pointerId
        );


        element.classList.add(
          "dragging"
        );


        const move =
          (pointerEvent) => {

            const drag =
              dragRef.current;

            if (!drag) {
              return;
            }


            const x =
              pointerEvent.clientX -
              drag.startX;

            const y =
              pointerEvent.clientY -
              drag.startY;


            /*
              PERFORMANCE OPTIMIZATION

              No React state update here.

              The browser directly handles
              the transform.

              Therefore pointer movement
              does not cause React renders.
            */

            drag.element.style.transform =
              `translate3d(${x}px, ${y}px, 0)`;

          };


        const up =
          (pointerEvent) => {

            const drag =
              dragRef.current;

            if (!drag) {
              return;
            }


            drag.element.style.transform =
              "";


            drag.element.classList.remove(
              "dragging"
            );


            const target =
              document.elementFromPoint(
                pointerEvent.clientX,
                pointerEvent.clientY
              );


            const day =
              target?.closest(
                "[data-date]"
              );


            if (day) {

              const targetDate =
                day.dataset.date;


              if (
                targetDate &&
                targetDate !==
                  drag.post.date
              ) {

                movePost(
                  drag.post.id,
                  targetDate
                );

              }
            }


            dragRef.current =
              null;


            window.removeEventListener(
              "pointermove",
              move
            );


            window.removeEventListener(
              "pointerup",
              up
            );

          };


        window.addEventListener(
          "pointermove",
          move
        );


        window.addEventListener(
          "pointerup",
          up
        );

      },
      [movePost]
    );


  /* =====================================================
     KEYBOARD MOVE
  ===================================================== */

  const moveKeyboard =
    useCallback(
      (post, direction) => {

        const current =
          parseDate(
            post.date
          );


        const target =
          addDays(
            current,
            direction
          );


        movePost(
          post.id,
          dateKey(target)
        );

      },
      [movePost]
    );


  /* =====================================================
     DELETE
  ===================================================== */

  const deletePost =
    useCallback(
      (id) => {

        const post =
          state.postsById[id];

        if (!post) {
          return;
        }


        dispatch({
          type: "DELETE",
          id,
        });


        setMessage(
          `${post.title} deleted`
        );

      },
      [
        state.postsById,
      ]
    );


  /* =====================================================
     ADD POST
  ===================================================== */

  const addPost =
    useCallback(() => {

      const title =
        window.prompt(
          "Enter post title:"
        );


      if (!title) {
        return;
      }


      const date =
        window.prompt(
          "Enter date (YYYY-MM-DD):",
          dateKey(
            new Date()
          )
        );


      if (!date) {
        return;
      }


      const time =
        window.prompt(
          "Enter time (HH:MM):",
          "10:00"
        ) ||
        "10:00";


      const newPost = {
        id:
          Date.now().toString(),

        title,

        date,

        time,

        platform:
          "Instagram",

        status:
          "Scheduled",
      };


      dispatch({
        type: "ADD",
        post: newPost,
      });


      setMessage(
        `${title} scheduled for ${date}`
      );

    }, []);


  /* =====================================================
     NAVIGATION
  ===================================================== */

  const previousMonth =
    useCallback(() => {

      setMonth(
        (current) =>
          new Date(
            current.getFullYear(),
            current.getMonth() - 1,
            1
          )
      );

    }, []);


  const nextMonth =
    useCallback(() => {

      setMonth(
        (current) =>
          new Date(
            current.getFullYear(),
            current.getMonth() + 1,
            1
          )
      );

    }, []);


  const goToday =
    useCallback(() => {

      const today =
        new Date();

      setMonth(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        )
      );

    }, []);


  /* =====================================================
     MONTH NAME
  ===================================================== */

  const monthName =
    useMemo(
      () =>
        month.toLocaleDateString(
          "en-US",
          {
            month: "long",
            year: "numeric",
          }
        ),
      [month]
    );


  /* =====================================================
     TOTAL POSTS
  ===================================================== */

  const totalPosts =
    Object.keys(
      state.postsById
    ).length;


  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div>

          <h1>
            📅 Social Media Scheduler
          </h1>

          <p>
            Optimized calendar with
            low-render drag & drop
          </p>

        </div>


        <button
          type="button"
          className="add-button"
          onClick={addPost}
        >
          + Add Post
        </button>

      </header>


      {/* CONTROLS */}

      <section className="controls">

        <input
          type="search"
          placeholder="Search posts..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />


        <select
          value={platform}
          onChange={(event) =>
            setPlatform(
              event.target.value
            )
          }
        >

          <option value="All">
            All Platforms
          </option>

          <option value="Instagram">
            Instagram
          </option>

          <option value="LinkedIn">
            LinkedIn
          </option>

          <option value="X">
            X
          </option>

        </select>


        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >

          <option value="All">
            All Status
          </option>

          <option value="Scheduled">
            Scheduled
          </option>

          <option value="Draft">
            Draft
          </option>

          <option value="Published">
            Published
          </option>

        </select>

      </section>


      {/* CALENDAR HEADER */}

      <section className="calendar-container">

        <div className="calendar-toolbar">

          <button
            type="button"
            onClick={
              previousMonth
            }
          >
            ←
          </button>


          <button
            type="button"
            onClick={
              goToday
            }
          >
            Today
          </button>


          <h2>
            {monthName}
          </h2>


          <button
            type="button"
            onClick={
              nextMonth
            }
          >
            →
          </button>

        </div>


        {/* WEEK DAYS */}

        <div className="weekdays">

          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (

            <div
              key={day}
            >
              {day}
            </div>

          ))}

        </div>


        {/* CALENDAR GRID */}

        <div className="calendar-grid">

          {dates.map(
            (date) => (

              <CalendarDay
                key={date}
                date={date}
                month={month}

                posts={
                  filteredPostsByDate[
                    date
                  ] || []
                }

                onDrop={
                  handleDrop
                }

                onPointerDown={
                  handlePointerDown
                }

                onDelete={
                  deletePost
                }

                onMoveKeyboard={
                  moveKeyboard
                }
              />

            )
          )}

        </div>

      </section>


      {/* STATUS */}

      <footer className="status">

        <span>
          ⚡ Optimized rendering
        </span>

        <span>
          {totalPosts} posts
        </span>

        <span>
          {message}
        </span>

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
};
