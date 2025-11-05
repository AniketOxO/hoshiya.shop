/**
 * Verification and Cleanup Script
 * Run this to verify optimization and optionally clean up backup files
 */

const fs = require('fs');
const path = require('path');

function getDirectorySize(dirPath) {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
            totalSize += stats.size;
        } else if (stats.isDirectory()) {
            totalSize += getDirectorySize(filePath);
        }
    }
    
    return totalSize;
}

function verifyOptimization() {
    console.log('🔍 Verifying Image Optimization...\n');
    console.log('='.repeat(60));
    
    // Check if webp folder exists
    const webpDir = path.join(__dirname, 'images', 'webp');
    if (!fs.existsSync(webpDir)) {
        console.log('❌ WebP folder not found!');
        console.log('   Run: node optimize-images.js');
        return false;
    }
    
    // Count files
    const webpFiles = fs.readdirSync(webpDir).filter(f => f.endsWith('.webp'));
    console.log(`✓ WebP images created: ${webpFiles.length}`);
    
    // Calculate sizes
    const imagesDir = path.join(__dirname, 'images');
    const originalSize = getDirectorySize(imagesDir) - getDirectorySize(webpDir);
    const webpSize = getDirectorySize(webpDir);
    const savings = ((originalSize - webpSize) / originalSize * 100);
    
    console.log(`✓ Original images size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`✓ WebP images size: ${(webpSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`✓ Space saved: ${((originalSize - webpSize) / 1024 / 1024).toFixed(2)} MB (${savings.toFixed(1)}%)`);
    
    // Check HTML updates
    console.log('\n' + '='.repeat(60));
    console.log('HTML Files Status:');
    console.log('='.repeat(60));
    
    const htmlFiles = ['index.html', 'about.html'];
    for (const file of htmlFiles) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const hasPictureTags = content.includes('<picture>');
            const hasWebP = content.includes('images/webp/');
            
            if (hasPictureTags && hasWebP) {
                console.log(`✓ ${file} - Using WebP images`);
            } else {
                console.log(`⚠ ${file} - Not fully optimized`);
            }
        }
    }
    
    // Check for backups
    console.log('\n' + '='.repeat(60));
    console.log('Backup Files:');
    console.log('='.repeat(60));
    
    const backupFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.backup'));
    if (backupFiles.length > 0) {
        console.log(`Found ${backupFiles.length} backup files:`);
        backupFiles.forEach(f => console.log(`  • ${f}`));
        console.log('\nTo remove backups after verification, run:');
        console.log('  node verify-optimization.js --cleanup');
    } else {
        console.log('No backup files found');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification Complete!');
    console.log('='.repeat(60));
    
    return true;
}

function cleanupBackups() {
    console.log('🧹 Cleaning up backup files...\n');
    
    const backupFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.backup'));
    
    if (backupFiles.length === 0) {
        console.log('No backup files to clean up.');
        return;
    }
    
    for (const file of backupFiles) {
        try {
            fs.unlinkSync(path.join(__dirname, file));
            console.log(`✓ Deleted ${file}`);
        } catch (error) {
            console.log(`✗ Failed to delete ${file}: ${error.message}`);
        }
    }
    
    console.log(`\n✅ Cleaned up ${backupFiles.length} backup file(s)`);
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--cleanup')) {
    cleanupBackups();
} else {
    verifyOptimization();
}
