#!/bin/bash

# FlavorWheel México - Deployment Script
# This script handles deployment to different environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="flavorwheel-mexico"
ENVIRONMENTS=("development" "staging" "production")
REQUIRED_TOOLS=("node" "npm" "supabase" "docker" "git")

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    for tool in "${REQUIRED_TOOLS[@]}"; do
        if ! command -v $tool &> /dev/null; then
            log_error "$tool is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_NODE_VERSION="18.0.0"
    
    if ! npx semver -r ">=$REQUIRED_NODE_VERSION" "$NODE_VERSION" &> /dev/null; then
        log_error "Node.js version $NODE_VERSION is not supported. Required: >=$REQUIRED_NODE_VERSION"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

validate_environment() {
    local env=$1
    
    if [[ ! " ${ENVIRONMENTS[@]} " =~ " ${env} " ]]; then
        log_error "Invalid environment: $env"
        log_info "Valid environments: ${ENVIRONMENTS[*]}"
        exit 1
    fi
}

setup_environment() {
    local env=$1
    log_info "Setting up environment: $env"
    
    # Copy appropriate environment file
    if [ -f ".env.$env" ]; then
        cp ".env.$env" ".env.local"
        log_success "Environment file copied: .env.$env -> .env.local"
    else
        log_warning "Environment file .env.$env not found, using .env.example"
        cp ".env.example" ".env.local"
    fi
    
    # Load environment variables
    if [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
    fi
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install Node.js dependencies
    npm ci
    
    # Install mobile dependencies if React Native project exists
    if [ -d "mobile" ]; then
        cd mobile
        npm ci
        cd ..
    fi
    
    log_success "Dependencies installed"
}

run_tests() {
    log_info "Running tests..."
    
    # Run unit tests
    npm run test:unit
    
    # Run integration tests
    npm run test:integration
    
    # Run E2E tests for staging and production
    if [ "$ENVIRONMENT" != "development" ]; then
        npm run test:e2e
    fi
    
    log_success "All tests passed"
}

build_application() {
    local env=$1
    log_info "Building application for $env..."
    
    # Build web application
    npm run build
    
    # Build mobile application if needed
    if [ "$env" = "production" ] && [ -d "mobile" ]; then
        cd mobile
        
        # Build iOS
        if [ "$(uname)" = "Darwin" ]; then
            npx react-native run-ios --configuration Release
        fi
        
        # Build Android
        npx react-native run-android --variant=release
        
        cd ..
    fi
    
    log_success "Application built successfully"
}

deploy_database() {
    local env=$1
    log_info "Deploying database migrations for $env..."
    
    # Run Supabase migrations
    if [ "$env" = "production" ]; then
        supabase db push --linked
    else
        supabase db push --local
    fi
    
    # Run custom migration script
    if [ -f "database/migrations/001_comprehensive_schema_update.sql" ]; then
        log_info "Running comprehensive schema update..."
        supabase db reset --linked
    fi
    
    log_success "Database deployed successfully"
}

deploy_storage() {
    log_info "Setting up storage buckets..."
    
    # Create storage buckets if they don't exist
    supabase storage create tasting-photos --public
    supabase storage create profile-avatars --public
    supabase storage create tasting-exports --private
    
    log_success "Storage buckets configured"
}

deploy_edge_functions() {
    log_info "Deploying edge functions..."
    
    # Deploy all edge functions
    if [ -d "supabase/functions" ]; then
        for func in supabase/functions/*/; do
            func_name=$(basename "$func")
            supabase functions deploy "$func_name"
        done
    fi
    
    log_success "Edge functions deployed"
}

deploy_web() {
    local env=$1
    log_info "Deploying web application to $env..."
    
    case $env in
        "development")
            # Local development
            npm run dev
            ;;
        "staging")
            # Deploy to Vercel staging
            npx vercel --prod=false
            ;;
        "production")
            # Deploy to Vercel production
            npx vercel --prod
            ;;
    esac
    
    log_success "Web application deployed"
}

deploy_mobile() {
    local env=$1
    
    if [ ! -d "mobile" ]; then
        log_warning "Mobile directory not found, skipping mobile deployment"
        return
    fi
    
    log_info "Deploying mobile application to $env..."
    
    cd mobile
    
    case $env in
        "staging")
            # Deploy to TestFlight/Internal Testing
            if [ "$(uname)" = "Darwin" ]; then
                npx eas build --platform ios --profile preview
            fi
            npx eas build --platform android --profile preview
            ;;
        "production")
            # Deploy to App Store/Play Store
            if [ "$(uname)" = "Darwin" ]; then
                npx eas build --platform ios --profile production
                npx eas submit --platform ios
            fi
            npx eas build --platform android --profile production
            npx eas submit --platform android
            ;;
    esac
    
    cd ..
    log_success "Mobile application deployed"
}

setup_monitoring() {
    local env=$1
    log_info "Setting up monitoring for $env..."
    
    # Setup Sentry for error tracking
    if [ -n "$SENTRY_DSN" ]; then
        npx @sentry/cli releases new "$PROJECT_NAME@$(git rev-parse HEAD)"
        npx @sentry/cli releases set-commits "$PROJECT_NAME@$(git rev-parse HEAD)" --auto
        npx @sentry/cli releases finalize "$PROJECT_NAME@$(git rev-parse HEAD)"
    fi
    
    # Setup analytics
    if [ "$env" = "production" ] && [ -n "$NEXT_PUBLIC_GOOGLE_ANALYTICS_ID" ]; then
        log_info "Google Analytics configured"
    fi
    
    log_success "Monitoring configured"
}

run_health_checks() {
    local env=$1
    log_info "Running health checks for $env..."
    
    # Wait for application to be ready
    sleep 30
    
    # Check application health
    if [ "$env" != "development" ]; then
        curl -f "$NEXT_PUBLIC_APP_URL/api/health" || {
            log_error "Health check failed"
            exit 1
        }
    fi
    
    # Check database connectivity
    supabase db ping || {
        log_error "Database health check failed"
        exit 1
    }
    
    log_success "All health checks passed"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove temporary files
    rm -f .env.local.tmp
    
    # Clean up build artifacts if needed
    if [ "$CLEANUP_BUILD" = "true" ]; then
        rm -rf .next
        rm -rf dist
    fi
    
    log_success "Cleanup completed"
}

main() {
    local environment=${1:-development}
    local skip_tests=${2:-false}
    
    log_info "Starting deployment to $environment environment"
    log_info "Project: $PROJECT_NAME"
    log_info "Commit: $(git rev-parse HEAD)"
    log_info "Branch: $(git branch --show-current)"
    
    # Validate inputs
    validate_environment "$environment"
    
    # Check prerequisites
    check_prerequisites
    
    # Setup environment
    setup_environment "$environment"
    
    # Install dependencies
    install_dependencies
    
    # Run tests (unless skipped)
    if [ "$skip_tests" != "true" ]; then
        run_tests
    fi
    
    # Build application
    build_application "$environment"
    
    # Deploy components
    deploy_database "$environment"
    deploy_storage
    deploy_edge_functions
    deploy_web "$environment"
    
    # Deploy mobile for staging and production
    if [ "$environment" != "development" ]; then
        deploy_mobile "$environment"
    fi
    
    # Setup monitoring
    setup_monitoring "$environment"
    
    # Run health checks
    run_health_checks "$environment"
    
    # Cleanup
    cleanup
    
    log_success "Deployment to $environment completed successfully!"
    log_info "Application URL: $NEXT_PUBLIC_APP_URL"
}

# Handle script arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [environment] [skip_tests]"
        echo "Environments: ${ENVIRONMENTS[*]}"
        echo "Example: $0 production false"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
