/**
 * Image Optimization Script for Hoshiya.shop
 * Converts PNG/JPG images to optimized WebP format using sharp
 * 
 * Install dependencies first: npm install sharp
 * Run: node optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images');
const OUTPUT_DIR = path.join(IMAGES_DIR, 'webp');
const QUALITY = 85;
const EXTENSIONS = ['.png', '.jpg', '.jpeg'];

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizeImage(inputPath, outputPath) {
    try {
        const stats = fs.statSync(inputPath);
        const originalSize = stats.size / 1024; // KB

        await sharp(inputPath)
            .webp({ quality: QUALITY, effort: 6 })
            .toFile(outputPath);

        const newStats = fs.statSync(outputPath);
        const newSize = newStats.size / 1024; // KB
        const savings = ((originalSize - newSize) / originalSize) * 100;

        console.log(`✓ ${path.basename(inputPath)}`);
        console.log(`  ${originalSize.toFixed(1)}KB → ${newSize.toFixed(1)}KB (${savings.toFixed(1)}% smaller)\n`);

        return { originalSize, newSize, success: true };
    } catch (error) {
        console.log(`✗ Error processing ${path.basename(inputPath)}: ${error.message}\n`);
        return { originalSize: 0, newSize: 0, success: false };
    }
}

async function main() {
    console.log('Starting image optimization...\n');

    // Get all image files
    const files = fs.readdirSync(IMAGES_DIR)
        .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return EXTENSIONS.includes(ext);
        })
        .map(file => path.join(IMAGES_DIR, file));

    console.log(`Found ${files.length} images to optimize\n`);

    let successCount = 0;
    let totalOriginalSize = 0;
    let totalNewSize = 0;

    for (const inputPath of files) {
        const basename = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(OUTPUT_DIR, `${basename}.webp`);

        const result = await optimizeImage(inputPath, outputPath);
        
        if (result.success) {
            successCount++;
            totalOriginalSize += result.originalSize;
            totalNewSize += result.newSize;
        }
    }

    // Summary
    const totalSavings = ((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100;
    
    console.log('='.repeat(60));
    console.log('Optimization Complete!');
    console.log('='.repeat(60));
    console.log(`Images processed: ${successCount}/${files.length}`);
    console.log(`Total original size: ${(totalOriginalSize / 1024).toFixed(2)} MB`);
    console.log(`Total new size: ${(totalNewSize / 1024).toFixed(2)} MB`);
    console.log(`Total savings: ${((totalOriginalSize - totalNewSize) / 1024).toFixed(2)} MB (${totalSavings.toFixed(1)}%)`);
    console.log(`\nOptimized images saved to: ${OUTPUT_DIR}`);
}

main().catch(console.error);
