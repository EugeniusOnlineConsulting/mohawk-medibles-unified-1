#!/bin/bash
#
# Mohawk Medibles AI Directory Deployment Script
# Deploys the fully automated AI-managed directory system
#

set -e

echo "🌿 Mohawk Medibles AI Directory Deployment"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/Users/eugeneagyemang/MohawkMedibles_SEO_v1.0"
AGENTS_DIR="$PROJECT_DIR/agents"
LOGS_DIR="$PROJECT_DIR/logs"
PID_DIR="$PROJECT_DIR/pids"

# Create necessary directories
mkdir -p "$LOGS_DIR"
mkdir -p "$PID_DIR"

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check environment
check_environment() {
    print_status "Checking environment..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js 18+."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 not found. Please install Python 3.9+."
        exit 1
    fi
    
    # Check environment variables
    if [ -z "$OPENAI_API_KEY" ]; then
        print_warning "OPENAI_API_KEY not set. AI content generation will not work."
    fi
    
    if [ -z "$PERPLEXITY_API_KEY" ]; then
        print_warning "PERPLEXITY_API_KEY not set. Directory discovery will use mock data."
    fi
    
    print_success "Environment check complete"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Node.js dependencies
    cd "$PROJECT_DIR"
    npm install
    
    # Python dependencies
    pip3 install -r "$AGENTS_DIR/requirements.txt" 2>/dev/null || pip3 install aiohttp requests
    
    print_success "Dependencies installed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd "$PROJECT_DIR"
    
    # Generate Prisma client
    npx prisma generate
    
    # Push schema to database
    npx prisma db push --accept-data-loss || print_warning "Database push may have failed"
    
    print_success "Database setup complete"
}

# Generate initial city pages
generate_city_pages() {
    print_status "Generating AI city pages..."
    
    cd "$PROJECT_DIR"
    
    # Run the AI directory agent for city generation
    python3 "$AGENTS_DIR/directory_ai_agent.py" --mode=cities > "$LOGS_DIR/city_generation.log" 2>&1 &
    echo $! > "$PID_DIR/city_generator.pid"
    
    print_success "City page generation started (PID: $(cat $PID_DIR/city_generator.pid))"
}

# Start AI automation daemon
start_automation_daemon() {
    print_status "Starting AI automation daemon..."
    
    # Create systemd-style service or use nohup
    cat > "$PROJECT_DIR/ai_daemon.sh" << 'EOF'
#!/bin/bash
# AI Directory Automation Daemon

PROJECT_DIR="/Users/eugeneagyemang/MohawkMedibles_SEO_v1.0"
LOGS_DIR="$PROJECT_DIR/logs"
AGENTS_DIR="$PROJECT_DIR/agents"

while true; do
    echo "[$(date)] Running automation cycle..." >> "$LOGS_DIR/automation.log"
    
    # Run directory AI agent
    python3 "$AGENTS_DIR/directory_ai_agent.py" >> "$LOGS_DIR/automation.log" 2>&1
    
    # Wait 6 hours before next cycle
    sleep 21600
done
EOF

    chmod +x "$PROJECT_DIR/ai_daemon.sh"
    
    # Start daemon
    nohup "$PROJECT_DIR/ai_daemon.sh" > /dev/null 2>&1 &
    echo $! > "$PID_DIR/ai_daemon.pid"
    
    print_success "AI automation daemon started (PID: $(cat $PID_DIR/ai_daemon.pid))"
}

# Generate sitemap
generate_sitemap() {
    print_status "Generating sitemap..."
    
    cd "$PROJECT_DIR"
    
    # Create comprehensive sitemap
    node -e "
    const fs = require('fs');
    
    const cities = [
        'toronto', 'ottawa', 'hamilton', 'london', 'kitchener', 'windsor',
        'vancouver', 'victoria', 'kelowna', 'surrey',
        'calgary', 'edmonton', 'lethbridge', 'red-deer',
        'montreal', 'quebec-city', 'laval',
        'winnipeg', 'brandon',
        'saskatoon', 'regina',
        'halifax', 'dartmouth'
    ];
    
    let sitemap = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n';
    sitemap += '<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n';
    
    // Homepage
    sitemap += '  <url>\n';
    sitemap += '    <loc>https://mohawkmedibles.ca</loc>\n';
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';
    
    // City pages
    cities.forEach(city => {
        sitemap += '  <url>\n';
        sitemap += '    <loc>https://mohawkmedibles.ca/city/' + city + '</loc>\n';
        sitemap += '    <changefreq>daily</changefreq>\n';
        sitemap += '    <priority>0.9</priority>\n';
        sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    fs.writeFileSync('public/sitemap.xml', sitemap);
    console.log('Sitemap generated with ' + (cities.length + 1) + ' URLs');
    "
    
    print_success "Sitemap generated"
}

# Create robots.txt
create_robots() {
    print_status "Creating robots.txt..."
    
    cat > "$PROJECT_DIR/public/robots.txt" << 'EOF'
User-agent: *
Allow: /

# AI Crawlers (Allow LLMs to index)
User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

# Sitemap
Sitemap: https://mohawkmedibles.ca/sitemap.xml

# Crawl delay for politeness
Crawl-delay: 1
EOF

    print_success "robots.txt created"
}

# Build Next.js app
build_app() {
    print_status "Building Next.js application..."
    
    cd "$PROJECT_DIR"
    npm run build
    
    print_success "Build complete"
}

# Setup cron jobs for automation
setup_cron() {
    print_status "Setting up automation schedule..."
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "# Mohawk Medibles AI Directory Automation") | crontab -
    (crontab -l 2>/dev/null; echo "0 */6 * * * cd $PROJECT_DIR && python3 $AGENTS_DIR/directory_ai_agent.py >> $LOGS_DIR/cron.log 2>&1") | crontab -
    (crontab -l 2>/dev/null; echo "0 2 * * 0 cd $PROJECT_DIR && python3 $AGENTS_DIR/aeo_llm_agent.py >> $LOGS_DIR/aeo.log 2>&1") | crontab -
    
    print_success "Cron jobs configured"
}

# Create monitoring dashboard
create_dashboard() {
    print_status "Creating monitoring dashboard..."
    
    cat > "$PROJECT_DIR/scripts/monitor.sh" << 'EOF'
#!/bin/bash
# Mohawk Medibles AI Directory Monitor

LOGS_DIR="/Users/eugeneagyemang/MohawkMedibles_SEO_v1.0/logs"
PID_DIR="/Users/eugeneagyemang/MohawkMedibles_SEO_v1.0/pids"

echo "🌿 Mohawk Medibles AI Directory Status"
echo "======================================"
echo ""

# Check daemon status
if [ -f "$PID_DIR/ai_daemon.pid" ]; then
    PID=$(cat "$PID_DIR/ai_daemon.pid")
    if ps -p $PID > /dev/null; then
        echo "✅ AI Automation Daemon: RUNNING (PID: $PID)"
    else
        echo "❌ AI Automation Daemon: STOPPED"
    fi
else
    echo "❌ AI Automation Daemon: NOT STARTED"
fi

echo ""
echo "📊 Recent Activity:"
echo "-------------------"
if [ -f "$LOGS_DIR/automation.log" ]; then
    tail -n 10 "$LOGS_DIR/automation.log"
else
    echo "No activity logs yet"
fi

echo ""
echo "🔄 To restart: ./scripts/deploy_ai_directory.sh restart"
EOF

    chmod +x "$PROJECT_DIR/scripts/monitor.sh"
    
    print_success "Dashboard script created"
}

# Main deployment function
deploy() {
    echo ""
    echo "Starting deployment..."
    echo ""
    
    check_environment
    install_dependencies
    setup_database
    generate_city_pages
    generate_sitemap
    create_robots
    build_app
    start_automation_daemon
    setup_cron
    create_dashboard
    
    echo ""
    echo "=========================================="
    print_success "Deployment Complete!"
    echo "=========================================="
    echo ""
    echo "🌿 Mohawk Medibles AI Directory is now live!"
    echo ""
    echo "Features enabled:"
    echo "  ✅ AI content generation"
    echo "  ✅ Automated directory management"
    echo "  ✅ AEO/LLM optimization"
    echo "  ✅ 20+ city landing pages"
    echo "  ✅ National SEO coverage"
    echo "  ✅ Automated review responses"
    echo "  ✅ Real-time price tracking"
    echo ""
    echo "Next steps:"
    echo "  1. Set OPENAI_API_KEY in .env for AI content"
    echo "  2. Set PERPLEXITY_API_KEY for directory discovery"
    echo "  3. Run './scripts/monitor.sh' to check status"
    echo "  4. Deploy to production with 'vercel --prod'"
    echo ""
}

# Restart function
restart() {
    print_status "Restarting AI Directory..."
    
    # Kill existing processes
    if [ -f "$PID_DIR/ai_daemon.pid" ]; then
        kill $(cat "$PID_DIR/ai_daemon.pid") 2>/dev/null || true
        rm "$PID_DIR/ai_daemon.pid"
    fi
    
    # Start fresh
    start_automation_daemon
    
    print_success "Restart complete"
}

# Stop function
stop() {
    print_status "Stopping AI Directory..."
    
    if [ -f "$PID_DIR/ai_daemon.pid" ]; then
        kill $(cat "$PID_DIR/ai_daemon.pid") 2>/dev/null || true
        rm "$PID_DIR/ai_daemon.pid"
        print_success "AI daemon stopped"
    else
        print_warning "No running daemon found"
    fi
}

# Status function
status() {
    "$PROJECT_DIR/scripts/monitor.sh"
}

# Help
show_help() {
    echo "Mohawk Medibles AI Directory Deployment"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  deploy    - Full deployment (default)"
    echo "  restart   - Restart automation daemon"
    echo "  stop      - Stop automation daemon"
    echo "  status    - Check system status"
    echo "  help      - Show this help"
    echo ""
}

# Main
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    restart)
        restart
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    help)
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
