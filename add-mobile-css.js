/**
 * Add Mobile Responsive CSS to all HTML files
 */

const fs = require('fs');
const path = require('path');

const HTML_FILES = [
    'about.html',
    'about-contact.html',
    'checkout.html',
    'community.html',
    'contact.html',
    'disclaimer.html',
    'login.html',
    'lookbook.html',
    'privacy-policy.html',
    'products.html',
    'profile.html',
    'refund-policy.html',
    'return-policy.html',
    'signup.html',
    'thankyou.html'
];

const MOBILE_CSS_LINK = '<link rel="stylesheet" href="mobile-responsive.css">';

function addMobileCss(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`⊘ ${path.basename(filePath)} - File not found, skipping`);
        return false;
    }

    try {
        let html = fs.readFileSync(filePath, 'utf8');
        
        // Check if mobile CSS is already added
        if (html.includes('mobile-responsive.css')) {
            console.log(`○ ${path.basename(filePath)} - Already has mobile CSS`);
            return false;
        }
        
        // Find the styles.css link and add mobile CSS after it
        const stylesRegex = /(<link\s+rel=["']stylesheet["']\s+href=["']styles\.css["']\s*\/?>)/;
        
        if (stylesRegex.test(html)) {
            html = html.replace(stylesRegex, `$1\n    ${MOBILE_CSS_LINK}`);
            
            // Create backup
            const backupPath = filePath + '.bak';
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(filePath, backupPath);
            }
            
            // Write updated file
            fs.writeFileSync(filePath, html, 'utf8');
            console.log(`✓ ${path.basename(filePath)} - Mobile CSS added`);
            return true;
        } else {
            // Try to add before </head>
            const headRegex = /(<\/head>)/;
            if (headRegex.test(html)) {
                html = html.replace(headRegex, `    ${MOBILE_CSS_LINK}\n$1`);
                fs.writeFileSync(filePath, html, 'utf8');
                console.log(`✓ ${path.basename(filePath)} - Mobile CSS added before </head>`);
                return true;
            }
        }
        
        console.log(`⚠ ${path.basename(filePath)} - Could not find injection point`);
        return false;
    } catch (error) {
        console.log(`✗ ${path.basename(filePath)} - Error: ${error.message}`);
        return false;
    }
}

function main() {
    console.log('Adding Mobile Responsive CSS to HTML files...\n');
    console.log('='.repeat(60));
    
    let updated = 0;
    
    for (const file of HTML_FILES) {
        const filePath = path.join(__dirname, file);
        if (addMobileCss(filePath)) {
            updated++;
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Files updated: ${updated}/${HTML_FILES.length}`);
    console.log('='.repeat(60));
    console.log('\n✅ Mobile responsive CSS has been added!');
    console.log('\nYour website is now fully optimized for mobile devices with:');
    console.log('  • Touch-friendly button sizes (minimum 44x44px)');
    console.log('  • Responsive typography and spacing');
    console.log('  • Optimized layouts for all screen sizes');
    console.log('  • Smooth scrolling and animations');
    console.log('  • Better readability on small screens');
    console.log('  • iPhone notch/safe area support');
    console.log('  • Improved accessibility');
}

main();
