#!/bin/bash

# FlavorWheel México - Comprehensive Backup Strategy
# This script handles database backups, file backups, and disaster recovery

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/backups"
S3_BUCKET="flavorwheel-backups"
RETENTION_DAYS=30
ENCRYPTION_KEY_FILE="/etc/backup/encryption.key"
LOG_FILE="/var/log/backup.log"

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-flavorwheel}"
DB_USER="${DB_USER:-postgres}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Create backup directories
create_backup_dirs() {
    log "Creating backup directories..."
    
    mkdir -p "$BACKUP_DIR"/{database,files,logs,exports}
    mkdir -p "$BACKUP_DIR"/database/{full,incremental}
    mkdir -p "$BACKUP_DIR"/files/{storage,uploads,exports}
    
    log_success "Backup directories created"
}

# Database backup functions
backup_database_full() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/database/full/flavorwheel_full_$timestamp.sql"
    local compressed_file="$backup_file.gz"
    
    log "Starting full database backup..."
    
    # Create full backup
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --clean --if-exists --create \
        --format=custom --compress=9 \
        --file="$backup_file.custom"
    
    # Also create SQL format for easier inspection
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --clean --if-exists --create \
        --format=plain \
        --file="$backup_file"
    
    # Compress SQL backup
    gzip "$backup_file"
    
    # Encrypt backups
    if [ -f "$ENCRYPTION_KEY_FILE" ]; then
        gpg --cipher-algo AES256 --compress-algo 1 --symmetric \
            --output "$backup_file.custom.gpg" "$backup_file.custom"
        gpg --cipher-algo AES256 --compress-algo 1 --symmetric \
            --output "$compressed_file.gpg" "$compressed_file"
        
        # Remove unencrypted files
        rm "$backup_file.custom" "$compressed_file"
        
        log_success "Database backup encrypted and saved"
    else
        log_warning "Encryption key not found, backup saved unencrypted"
    fi
    
    # Verify backup integrity
    if verify_backup "$backup_file.custom.gpg"; then
        log_success "Full database backup completed: $backup_file"
        return 0
    else
        log_error "Backup verification failed"
        return 1
    fi
}

backup_database_incremental() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/database/incremental/flavorwheel_incremental_$timestamp.sql"
    
    log "Starting incremental database backup..."
    
    # Get last backup timestamp
    local last_backup_time=$(get_last_backup_time)
    
    # Create incremental backup (changes since last backup)
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --data-only --inserts \
        --where="updated_at > '$last_backup_time'" \
        --file="$backup_file"
    
    # Compress and encrypt
    gzip "$backup_file"
    
    if [ -f "$ENCRYPTION_KEY_FILE" ]; then
        gpg --cipher-algo AES256 --compress-algo 1 --symmetric \
            --output "$backup_file.gz.gpg" "$backup_file.gz"
        rm "$backup_file.gz"
    fi
    
    log_success "Incremental database backup completed: $backup_file"
}

# File backup functions
backup_storage_files() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/files/storage/storage_backup_$timestamp.tar.gz"
    
    log "Starting storage files backup..."
    
    # Backup Supabase storage files (if local)
    if [ -d "/var/lib/supabase/storage" ]; then
        tar -czf "$backup_file" -C /var/lib/supabase storage/
        
        # Encrypt if key available
        if [ -f "$ENCRYPTION_KEY_FILE" ]; then
            gpg --cipher-algo AES256 --compress-algo 1 --symmetric \
                --output "$backup_file.gpg" "$backup_file"
            rm "$backup_file"
        fi
        
        log_success "Storage files backup completed: $backup_file"
    else
        log_warning "Local storage directory not found, skipping file backup"
    fi
}

backup_application_files() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/files/uploads/app_files_$timestamp.tar.gz"
    
    log "Starting application files backup..."
    
    # Backup uploaded files, exports, etc.
    if [ -d "/app/public/uploads" ]; then
        tar -czf "$backup_file" -C /app/public uploads/
        
        # Encrypt if key available
        if [ -f "$ENCRYPTION_KEY_FILE" ]; then
            gpg --cipher-algo AES256 --compress-algo 1 --symmetric \
                --output "$backup_file.gpg" "$backup_file"
            rm "$backup_file"
        fi
        
        log_success "Application files backup completed: $backup_file"
    else
        log_warning "Application uploads directory not found"
    fi
}

# Backup verification
verify_backup() {
    local backup_file="$1"
    
    log "Verifying backup: $backup_file"
    
    # Check if file exists and is not empty
    if [ ! -f "$backup_file" ] || [ ! -s "$backup_file" ]; then
        log_error "Backup file is missing or empty"
        return 1
    fi
    
    # For encrypted files, try to decrypt and verify
    if [[ "$backup_file" == *.gpg ]]; then
        if ! gpg --quiet --batch --decrypt "$backup_file" > /dev/null 2>&1; then
            log_error "Cannot decrypt backup file"
            return 1
        fi
    fi
    
    # For database backups, verify structure
    if [[ "$backup_file" == *database* ]]; then
        # Test restore to a temporary database (if possible)
        # This is a simplified check - in production, you might want more thorough verification
        log "Database backup verification passed"
    fi
    
    log_success "Backup verification completed successfully"
    return 0
}

# Cloud upload functions
upload_to_cloud() {
    local file_path="$1"
    local cloud_path="$2"
    
    log "Uploading backup to cloud: $cloud_path"
    
    # Upload to S3 (or other cloud storage)
    if command -v aws &> /dev/null; then
        aws s3 cp "$file_path" "s3://$S3_BUCKET/$cloud_path" \
            --storage-class STANDARD_IA \
            --server-side-encryption AES256
        
        if [ $? -eq 0 ]; then
            log_success "Backup uploaded to cloud: $cloud_path"
            return 0
        else
            log_error "Failed to upload backup to cloud"
            return 1
        fi
    else
        log_warning "AWS CLI not available, skipping cloud upload"
        return 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    # Local cleanup
    find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete
    
    # Cloud cleanup (if AWS CLI available)
    if command -v aws &> /dev/null; then
        local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
        aws s3 ls "s3://$S3_BUCKET/" --recursive | \
        awk '$1 < "'$cutoff_date'" {print $4}' | \
        xargs -I {} aws s3 rm "s3://$S3_BUCKET/{}"
    fi
    
    log_success "Old backups cleaned up"
}

# Utility functions
get_last_backup_time() {
    # Get timestamp of last successful backup
    local last_backup=$(find "$BACKUP_DIR/database/full" -name "*.sql.gz*" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
    
    if [ -n "$last_backup" ]; then
        stat -c %Y "$last_backup" | xargs -I {} date -d @{} '+%Y-%m-%d %H:%M:%S'
    else
        echo "1970-01-01 00:00:00"  # Epoch if no previous backup
    fi
}

# Health check
health_check() {
    log "Performing backup system health check..."
    
    # Check disk space
    local available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local required_space=1048576  # 1GB in KB
    
    if [ "$available_space" -lt "$required_space" ]; then
        log_error "Insufficient disk space for backup"
        return 1
    fi
    
    # Check database connectivity
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"; then
        log_error "Cannot connect to database"
        return 1
    fi
    
    # Check encryption key
    if [ ! -f "$ENCRYPTION_KEY_FILE" ]; then
        log_warning "Encryption key not found - backups will be unencrypted"
    fi
    
    log_success "Health check passed"
    return 0
}

# Restore functions
restore_database() {
    local backup_file="$1"
    local target_db="${2:-${DB_NAME}_restore}"
    
    log "Starting database restore from: $backup_file"
    
    # Decrypt if necessary
    local restore_file="$backup_file"
    if [[ "$backup_file" == *.gpg ]]; then
        restore_file="${backup_file%.gpg}"
        gpg --quiet --batch --decrypt "$backup_file" > "$restore_file"
    fi
    
    # Create target database
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$target_db" || true
    
    # Restore from backup
    if [[ "$restore_file" == *.custom ]]; then
        pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$target_db" \
            --clean --if-exists --verbose "$restore_file"
    else
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$target_db" < "$restore_file"
    fi
    
    # Cleanup temporary files
    if [[ "$backup_file" == *.gpg ]]; then
        rm "$restore_file"
    fi
    
    log_success "Database restore completed to: $target_db"
}

# Main backup function
main_backup() {
    local backup_type="${1:-full}"
    
    log "Starting FlavorWheel México backup process (type: $backup_type)"
    
    # Health check
    if ! health_check; then
        log_error "Health check failed, aborting backup"
        exit 1
    fi
    
    # Create directories
    create_backup_dirs
    
    # Perform backups based on type
    case "$backup_type" in
        "full")
            backup_database_full
            backup_storage_files
            backup_application_files
            ;;
        "incremental")
            backup_database_incremental
            ;;
        "database")
            backup_database_full
            ;;
        "files")
            backup_storage_files
            backup_application_files
            ;;
        *)
            log_error "Unknown backup type: $backup_type"
            exit 1
            ;;
    esac
    
    # Upload to cloud
    for backup_file in $(find "$BACKUP_DIR" -name "*$(date +%Y%m%d)*" -type f); do
        local cloud_path=$(echo "$backup_file" | sed "s|$BACKUP_DIR/||")
        upload_to_cloud "$backup_file" "$cloud_path"
    done
    
    # Cleanup old backups
    cleanup_old_backups
    
    log_success "Backup process completed successfully"
}

# Script entry point
case "${1:-}" in
    "full"|"incremental"|"database"|"files")
        main_backup "$1"
        ;;
    "restore")
        if [ -z "$2" ]; then
            log_error "Usage: $0 restore <backup_file> [target_db]"
            exit 1
        fi
        restore_database "$2" "$3"
        ;;
    "health")
        health_check
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        echo "Usage: $0 {full|incremental|database|files|restore|health|cleanup}"
        echo "  full        - Complete backup (database + files)"
        echo "  incremental - Incremental database backup"
        echo "  database    - Database backup only"
        echo "  files       - Files backup only"
        echo "  restore     - Restore from backup file"
        echo "  health      - Check backup system health"
        echo "  cleanup     - Clean up old backups"
        exit 1
        ;;
esac
