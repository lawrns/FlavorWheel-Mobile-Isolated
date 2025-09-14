#!/usr/bin/env node

/**
 * Card Migration Script
 * Automatically migrates Card components to use the new unified system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to migrate (from our grep analysis)
const filesToMigrate = [
  'app/[locale]/flavor-wheels/page.tsx',
  'app/[locale]/profile/page.tsx',
  'components/ui/simplified-tasting-flow.tsx',
  'app/[locale]/create/competition/page.client.tsx',
  'app/[locale]/review/page.tsx',
  'app/[locale]/study/[id]/confirm/page.client.tsx',
  'components/ui/loading-states.tsx',
  'app/[locale]/tastings/completed/page.tsx',
  'app/[locale]/study/[id]/page.tsx',
  'components/error-boundary.tsx',
  'app/[locale]/settings/page.tsx',
  'components/flavorwheel/FilterPanel.tsx',
  'app/[locale]/quick-tasting/[id]/confirm/page.client.tsx',
  'app/[locale]/tastings/[id]/input/page.client.tsx',
  'components/social-feed.tsx',
  'app/[locale]/tastings/id/page.tsx',
  'components/tasting-sharing.tsx',
  'app/[locale]/competition/[id]/results/page.tsx',
  'app/[locale]/create/study/page.tsx',
  'components/ui/offline-handler.tsx',
  'components/ui/error-message.tsx',
  'components/ui/error-boundary.tsx',
  'app/[locale]/tastings/[id]/page.tsx',
  'app/[locale]/competition/[id]/page.tsx',
  'app/[locale]/competition/[id]/confirm/page.client.tsx',
  'components/template-library.tsx',
  'app/[locale]/analytics/page.tsx',
  'components/ui/progressive-disclosure.tsx',
  'app/[locale]/social/page.tsx',
  'app/[locale]/create-wheel/page.tsx',
  'app/[locale]/create/study/page.client.tsx',
  'components/ui/photo-upload.tsx',
  'components/tasting-completion-screen.tsx',
  'components/ui/performance-dashboard.tsx',
  'components/ui/review-prompt.tsx',
  'app/[locale]/create/page.client.tsx',
  'components/event-calendar.tsx',
  'components/friend-system.tsx',
  'components/welcome-user-card.tsx',
  'components/sign-in-modal.tsx'
];

const basePath = path.join(__dirname, '..');

function migrateCardUsage(content, filePath) {
  let updatedContent = content;

  // Replace Card variants
  updatedContent = updatedContent.replace(
    /<Card\s+className="([^"]*shadow[^"]*)"([^>]*)>/g,
    '<Card variant="elevated" className="$1"$2>'
  );

  updatedContent = updatedContent.replace(
    /<Card\s+className="([^"]*cursor-pointer[^"]*)"([^>]*)>/g,
    '<Card variant="interactive" className="$1"$2>'
  );

  // Update text colors
  updatedContent = updatedContent.replace(
    /text-fx-text-primary/g,
    'text-card-text-primary'
  );

  updatedContent = updatedContent.replace(
    /text-fx-text-secondary/g,
    'text-card-text-secondary'
  );

  updatedContent = updatedContent.replace(
    /text-muted-foreground/g,
    'text-card-text-secondary'
  );

  // Update padding
  updatedContent = updatedContent.replace(
    /p-6/g,
    'p-card'
  );

  // Update border colors
  updatedContent = updatedContent.replace(
    /border-fx-border/g,
    'border-card-border'
  );

  return updatedContent;
}

function migrateFile(filePath) {
  const fullPath = path.join(basePath, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const migratedContent = migrateCardUsage(content, filePath);

    if (content !== migratedContent) {
      fs.writeFileSync(fullPath, migratedContent);
      console.log(`✅ Migrated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
  }
}

console.log('🚀 Starting Card Migration...\n');

filesToMigrate.forEach(migrateFile);

console.log('\n🎉 Card migration completed!');
console.log('📋 Summary:');
console.log(`   Files processed: ${filesToMigrate.length}`);
console.log('   Run "npm run lint" to check for any issues');
console.log('   Test the updated components to ensure they work correctly');


