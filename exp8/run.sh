#!/bin/bash
# Convenient script to run Exp -8 (Kafka + Spring Boot Backend + React Frontend)

JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home"
export JAVA_HOME
export PATH="$JAVA_HOME/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Exp -8 Event-Driven Publishing Pipeline..."

# 1. Start Kafka via Docker Compose if docker exists, or check port 9092
if ! lsof -i :9092 >/dev/null 2>&1; then
    if command -v docker >/dev/null 2>&1; then
        echo "📦 Starting Kafka via Docker Compose on port 9092..."
        docker compose -f "$SCRIPT_DIR/docker-compose.yml" up -d
    elif [ -d "$SCRIPT_DIR/../../Exp -8/kafka_2.13-3.8.0" ]; then
        echo "📦 Starting local Apache Kafka on port 9092..."
        cd "$SCRIPT_DIR/../../Exp -8/kafka_2.13-3.8.0"
        bash ./bin/kafka-run-class.sh kafka.Kafka ./config/kraft/server.properties &
        KAFKA_PID=$!
        sleep 3
    else
        echo "⚠️ Kafka broker is not running on port 9092. Please start Kafka using 'docker-compose up -d'."
    fi
else
    echo "✅ Kafka broker is running on port 9092."
fi

# 2. Start Backend
echo "📦 Starting Spring Boot Backend on port 8080..."
cd "$SCRIPT_DIR/backend"
mvn spring-boot:run &
BACKEND_PID=$!

# 3. Start Frontend
echo "💻 Starting React Frontend on port 5173..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID $KAFKA_PID 2>/dev/null; exit" SIGINT SIGTERM

echo "✅ Applications are running:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend:  http://localhost:8080"
echo "   - Kafka:    localhost:9092"
echo "   - H2 DB:    http://localhost:8080/h2-console"
echo "Press Ctrl+C to stop all servers."

wait
