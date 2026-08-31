#!/bin/bash
# Diagnostic script to identify why the app crashes after 10-20 minutes

set -e

PROJECT_DIR="/home/selim/repos/football-stat-tracker"
cd "$PROJECT_DIR"

echo "=== Container Status ==="
docker ps -a --filter "name=football-stat-tracker" --format "table {{.Names}}\t{{.Status}}\t{{.RestartCount}}" || true

echo ""
echo "=== App Container Logs (Last 50 lines) ==="
docker logs --tail=50 football-stat-tracker-app-1 2>&1 | tail -n 50 || echo "Container not found or no logs"

echo ""
echo "=== Recent Errors in App Logs ==="
docker logs football-stat-tracker-app-1 2>&1 | grep -iE "(error|exception|fatal|killed|oom|out of memory)" | tail -n 20 || echo "No errors found"

echo ""
echo "=== System Resources ==="
echo "Memory:"
free -h | grep -E "Mem|Swap" || true
echo ""
echo "Disk:"
df -h / | tail -n 1 || true

echo ""
echo "=== Container Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" football-stat-tracker-app-1 2>&1 || echo "Container not running"

echo ""
echo "=== Check for returnNaN errors ==="
docker logs football-stat-tracker-app-1 2>&1 | grep -i "returnNaN\|ReferenceError" | tail -n 10 || echo "No returnNaN errors in recent logs"

echo ""
echo "=== Check for memory-related kills ==="
dmesg | grep -i "killed process\|oom" | tail -n 5 || echo "No OOM kills found (may require sudo)"
