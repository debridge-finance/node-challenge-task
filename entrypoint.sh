#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL..."
sleep 10

echo "⏳ Waiting for Kafka..."
sleep 10

echo "✅ Starting application..."
exec node dist/main.js

