"""
Image Optimization Script for Hoshiya.shop
Converts PNG/JPG images to optimized WebP format
"""
import os
from pathlib import Path
from PIL import Image
import sys

def optimize_image(input_path, output_path, quality=85):
    """
    Convert and optimize image to WebP format
    
    Args:
        input_path: Path to source image
        output_path: Path to save WebP image
        quality: WebP quality (0-100, default 85)
    """
    try:
        with Image.open(input_path) as img:
            # Convert RGBA to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save as WebP
            img.save(output_path, 'WebP', quality=quality, method=6)
            
            # Get file sizes
            original_size = os.path.getsize(input_path) / 1024  # KB
            new_size = os.path.getsize(output_path) / 1024  # KB
            savings = ((original_size - new_size) / original_size) * 100
            
            print(f"✓ {os.path.basename(input_path)}")
            print(f"  {original_size:.1f}KB → {new_size:.1f}KB ({savings:.1f}% smaller)")
            
            return True
    except Exception as e:
        print(f"✗ Error processing {input_path}: {e}")
        return False

def main():
    # Setup paths
    images_dir = Path(__file__).parent / 'images'
    webp_dir = images_dir / 'webp'
    webp_dir.mkdir(exist_ok=True)
    
    # Image extensions to convert
    extensions = {'.png', '.jpg', '.jpeg'}
    
    # Find all images
    image_files = []
    for ext in extensions:
        image_files.extend(images_dir.glob(f'*{ext}'))
    
    print(f"Found {len(image_files)} images to optimize\n")
    
    success_count = 0
    total_original_size = 0
    total_new_size = 0
    
    for img_path in sorted(image_files):
        output_path = webp_dir / f"{img_path.stem}.webp"
        
        if optimize_image(img_path, output_path, quality=85):
            success_count += 1
            total_original_size += os.path.getsize(img_path) / 1024
            total_new_size += os.path.getsize(output_path) / 1024
        
        print()
    
    # Summary
    total_savings = ((total_original_size - total_new_size) / total_original_size) * 100
    print(f"\n{'='*60}")
    print(f"Optimization Complete!")
    print(f"{'='*60}")
    print(f"Images processed: {success_count}/{len(image_files)}")
    print(f"Total original size: {total_original_size/1024:.2f} MB")
    print(f"Total new size: {total_new_size/1024:.2f} MB")
    print(f"Total savings: {(total_original_size - total_new_size)/1024:.2f} MB ({total_savings:.1f}%)")
    print(f"\nOptimized images saved to: {webp_dir}")

if __name__ == "__main__":
    main()
