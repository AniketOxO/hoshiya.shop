# Image Optimization Guide for Hoshiya.shop

## 🚀 Quick Start - Automatic Optimization

### Option 1: Using Node.js (Recommended)

```powershell
# Install sharp (image processing library)
npm install sharp

# Run the optimization script
node optimize-images.js
```

This will:
- Convert all PNG/JPG images to WebP format
- Reduce file sizes by 70-90%
- Save optimized images to `images/webp/` folder
- Maintain high visual quality

### Option 2: Using Python

```powershell
# Install Pillow
pip install Pillow

# Run the optimization script
python optimize_images.py
```

## 📊 Current Issues

Your images are currently:
- **Format**: Mostly PNG (large file sizes)
- **Average size**: 1-2 MB per image
- **Total size**: ~150+ MB for all images
- **Load time**: 5-15+ seconds on slow connections

## ✅ After Optimization

Expected results:
- **Format**: WebP (modern, efficient)
- **Average size**: 100-300 KB per image (70-85% smaller)
- **Total size**: ~20-40 MB
- **Load time**: 1-3 seconds on slow connections

## 🛠️ Manual Steps After Running Script

### 1. Update HTML Files

Replace PNG references with WebP versions:

**Before:**
```html
<img src="images/Hoshiya X Mob Psycho 100.png" alt="..." />
```

**After:**
```html
<picture>
  <source srcset="images/webp/Hoshiya X Mob Psycho 100.webp" type="image/webp">
  <img src="images/Hoshiya X Mob Psycho 100.png" alt="..." loading="lazy" decoding="async" />
</picture>
```

This provides:
- Modern browsers get WebP (smaller, faster)
- Older browsers get PNG (fallback)

### 2. Add Responsive Images

For different screen sizes:

```html
<picture>
  <source 
    srcset="images/webp/product-small.webp 400w,
            images/webp/product-medium.webp 800w,
            images/webp/product-large.webp 1200w"
    type="image/webp"
    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw">
  <img src="images/product.png" alt="..." loading="lazy" />
</picture>
```

## 🎯 Additional Optimizations

### 1. Enable Browser Caching
Add to your server configuration or use CDN caching.

### 2. Use CDN
Host images on a CDN like:
- Cloudflare Images
- Cloudinary
- imgix
- AWS CloudFront

### 3. Implement Lazy Loading
Already implemented with `loading="lazy"` ✓

### 4. Add Blur Placeholder
Show blurred placeholder while loading:
- Use low-quality image placeholders (LQIP)
- Or CSS blur effect

## 📱 Testing

After optimization, test your site:

1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
2. **GTmetrix**: https://gtmetrix.com/
3. **WebPageTest**: https://www.webpagetest.org/

## 🔄 Ongoing Process

For new images:
1. Always optimize before uploading
2. Use WebP format
3. Keep PNG as fallback
4. Aim for <200KB per image

## 📦 Tools for Future Use

- **Online**: TinyPNG, Squoosh.app, Compressor.io
- **Command-line**: sharp, imagemagick
- **Automated**: GitHub Actions, Cloudflare Image Resizing
