#!/bin/bash
# Convenient script to run Student Task Manager (Backend + Frontend)

JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home"
export JAVA_HOME
export PATH="$JAVA_HOME/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Student Task Manager..."

# Start Backend
echo "📦 Starting Spring Boot Backend on port 8080..."
cd "$SCRIPT_DIR/backend"
mvn spring-boot:run &
BACKEND_PID=$!

# Start Frontend
echo "💻 Starting React Frontend on port 5173..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

echo "✅ Applications are launching:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend:  http://localhost:8080"
echo "   - H2 DB:    http://localhost:8080/h2-console"
echo "Press Ctrl+C to stop both servers."

wait
