#!/bin/bash
# Meridian Testing Sandbox - Quick Commands

set -e

COMMAND=$1

case "$COMMAND" in
  start)
    echo "🚀 Starting sandbox..."
    docker compose up -d app
    echo "✅ App running at http://localhost:3002"
    ;;
    
  start-all)
    echo "🚀 Starting full sandbox with testing containers..."
    docker compose --profile testing up -d
    echo "✅ All services running"
    ;;
    
  stop)
    echo "🛑 Stopping sandbox..."
    docker compose down
    ;;
    
  logs)
    docker compose logs -f app
    ;;
    
  shell)
    echo "🐚 Opening shell in app container..."
    docker compose exec app sh
    ;;
    
  test-shell)
    echo "🐚 Opening shell in tester container..."
    docker compose --profile testing exec tester sh
    ;;
    
  playwright-shell)
    echo "🎭 Opening shell in Playwright container..."
    docker compose --profile testing exec playwright bash
    ;;
    
  explore)
    echo "🔍 Running browser exploration..."
    docker compose --profile testing exec playwright npx ts-node /app/scripts/sandbox/explore-browser.ts
    ;;
    
  api-test)
    echo "🌐 Running API tests..."
    docker compose --profile testing exec tester npx ts-node /app/scripts/sandbox/test-api.ts
    ;;
    
  stress)
    echo "🔥 Running stress test..."
    docker compose --profile testing exec playwright npx ts-node -e "
      import('./scripts/sandbox/explore-browser').then(async ({ BrowserExplorer }) => {
        const explorer = await new BrowserExplorer().init();
        await explorer.stressTestEditor(200);
        await explorer.close();
      });
    "
    ;;
    
  rebuild)
    echo "🔄 Rebuilding containers..."
    docker compose build --no-cache
    ;;
    
  clean)
    echo "🧹 Cleaning up..."
    docker compose down -v --rmi local
    rm -rf test-results test-screenshots
    ;;
    
  *)
    echo "Meridian Testing Sandbox"
    echo ""
    echo "Usage: ./sandbox.sh <command>"
    echo ""
    echo "Commands:"
    echo "  start           Start the app container only"
    echo "  start-all       Start app + testing containers"
    echo "  stop            Stop all containers"
    echo "  logs            Follow app logs"
    echo "  shell           Open shell in app container"
    echo "  test-shell      Open shell in tester container"
    echo "  playwright-shell Open shell in Playwright container"
    echo "  explore         Run browser exploration script"
    echo "  api-test        Run API tests"
    echo "  stress          Run stress test"
    echo "  rebuild         Rebuild containers"
    echo "  clean           Stop and remove everything"
    ;;
esac
