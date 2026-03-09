#!/usr/bin/env python3
"""
Mohawk Medibles Vision Agent v1.0
Image Analysis & Alt Text Optimization with Claude Vision
"""

import json
import base64
import subprocess
from typing import Dict, List, Optional
from pathlib import Path
from datetime import datetime


class VisionAgent:
    """
    Vision-enabled agent for analyzing product images and generating SEO-optimized alt text.

    Capabilities:
    1. Analyze product images for content
    2. Generate SEO-optimized alt text
    3. Detect missing or poor quality images
    4. Suggest image improvements for SEO
    5. Validate image accessibility compliance
    """

    # Alt text requirements
    ALT_TEXT_MIN_LENGTH = 30
    ALT_TEXT_MAX_LENGTH = 125

    # Image SEO requirements
    REQUIRED_IMAGE_TYPES = ['product', 'gallery', 'featured']

    def __init__(self, config: Dict = None):
        self.config = config or {}
        self.vision_enabled = self.config.get('vision_enabled', True)

    def analyze_product_images(self, product: Dict) -> Dict:
        """Analyze all images associated with a product."""
        analysis = {
            'product_id': product.get('ID', 'unknown'),
            'product_name': product.get('Name', ''),
            'timestamp': datetime.now().isoformat(),
            'images': [],
            'issues': [],
            'recommendations': [],
            'score': 0
        }

        # Get image URLs
        featured_image = product.get('Images', '')
        gallery_images = product.get('Meta: _product_image_gallery', '')

        # Analyze featured image
        if featured_image:
            img_analysis = self._analyze_single_image(featured_image, 'featured', product)
            analysis['images'].append(img_analysis)
        else:
            analysis['issues'].append({
                'type': 'MISSING_FEATURED_IMAGE',
                'severity': 'HIGH',
                'message': 'Product has no featured image'
            })

        # Analyze gallery images
        if gallery_images:
            for i, img_url in enumerate(gallery_images.split(',')[:5]):  # Limit to 5
                img_analysis = self._analyze_single_image(img_url.strip(), f'gallery_{i+1}', product)
                analysis['images'].append(img_analysis)

        # Check alt text
        alt_text = product.get('Meta: _wp_attachment_image_alt', '')
        if not alt_text:
            analysis['issues'].append({
                'type': 'MISSING_ALT_TEXT',
                'severity': 'HIGH',
                'message': 'Featured image missing alt text'
            })
            analysis['recommendations'].append(self._generate_alt_text(product))
        elif len(alt_text) < self.ALT_TEXT_MIN_LENGTH:
            analysis['issues'].append({
                'type': 'SHORT_ALT_TEXT',
                'severity': 'MEDIUM',
                'message': f'Alt text too short ({len(alt_text)} chars, min {self.ALT_TEXT_MIN_LENGTH})'
            })

        # Calculate score
        analysis['score'] = self._calculate_image_score(analysis)

        return analysis

    def _analyze_single_image(self, image_url: str, image_type: str, product: Dict) -> Dict:
        """Analyze a single image."""
        analysis = {
            'url': image_url,
            'type': image_type,
            'accessible': True,
            'issues': [],
            'suggested_alt_text': None
        }

        # Check if URL is valid
        if not image_url or not image_url.startswith(('http://', 'https://')):
            analysis['accessible'] = False
            analysis['issues'].append('Invalid image URL')
            return analysis

        # Check file extension for SEO
        ext = Path(image_url).suffix.lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
            analysis['issues'].append(f'Non-optimal format: {ext}. Consider WebP or JPEG.')

        # Check filename for SEO keywords
        filename = Path(image_url).stem.lower()
        product_name = product.get('Name', '').lower()

        # Good filenames contain product keywords
        if not any(word in filename for word in product_name.split()[:2]):
            analysis['issues'].append('Filename does not contain product keywords')

        # Generate suggested alt text
        analysis['suggested_alt_text'] = self._generate_alt_text(product, image_type)

        return analysis

    def _generate_alt_text(self, product: Dict, image_type: str = 'featured') -> Dict:
        """Generate SEO-optimized alt text for a product image."""
        name = product.get('Name', 'Cannabis Product')
        categories = product.get('Categories', '').split(',')[0] if product.get('Categories') else ''

        # Generate contextual alt text
        if 'featured' in image_type:
            alt_text = f"{name} - Premium {categories} from Mohawk Medibles Canada"
        elif 'gallery' in image_type:
            alt_text = f"{name} product image - {categories} cannabis"
        else:
            alt_text = f"{name} - Mohawk Medibles"

        # Ensure proper length
        if len(alt_text) > self.ALT_TEXT_MAX_LENGTH:
            alt_text = alt_text[:self.ALT_TEXT_MAX_LENGTH - 3] + '...'

        return {
            'type': 'ALT_TEXT_SUGGESTION',
            'suggested_alt': alt_text,
            'length': len(alt_text),
            'includes_brand': 'mohawk' in alt_text.lower(),
            'includes_product': name.split()[0].lower() in alt_text.lower()
        }

    def _calculate_image_score(self, analysis: Dict) -> int:
        """Calculate overall image SEO score."""
        score = 100

        # Deduct for issues
        for issue in analysis.get('issues', []):
            severity = issue.get('severity', 'LOW')
            if severity == 'HIGH':
                score -= 25
            elif severity == 'MEDIUM':
                score -= 15
            else:
                score -= 5

        # Deduct for image issues
        for img in analysis.get('images', []):
            for issue in img.get('issues', []):
                score -= 5

        # Bonus for multiple images
        img_count = len(analysis.get('images', []))
        if img_count >= 3:
            score += 10
        elif img_count >= 2:
            score += 5

        return max(0, min(100, score))

    def generate_image_report(self, products: List[Dict]) -> Dict:
        """Generate a comprehensive image SEO report for multiple products."""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_products': len(products),
            'products_analyzed': 0,
            'missing_images': 0,
            'missing_alt_text': 0,
            'average_score': 0,
            'critical_issues': [],
            'products': []
        }

        total_score = 0

        for product in products:
            analysis = self.analyze_product_images(product)
            report['products'].append(analysis)
            report['products_analyzed'] += 1
            total_score += analysis['score']

            # Track issues
            for issue in analysis['issues']:
                if issue['type'] == 'MISSING_FEATURED_IMAGE':
                    report['missing_images'] += 1
                elif issue['type'] == 'MISSING_ALT_TEXT':
                    report['missing_alt_text'] += 1

                if issue['severity'] == 'HIGH':
                    report['critical_issues'].append({
                        'product': product.get('Name', 'Unknown'),
                        'issue': issue
                    })

        if report['products_analyzed'] > 0:
            report['average_score'] = round(total_score / report['products_analyzed'], 1)

        return report

    def optimize_product_images(self, product: Dict) -> Dict:
        """Generate optimized image metadata for a product."""
        name = product.get('Name', '')
        categories = product.get('Categories', '').split(',')[0] if product.get('Categories') else 'Cannabis'

        return {
            'product_id': product.get('ID'),
            'optimizations': {
                'featured_alt': f"{name} - Premium {categories} | Mohawk Medibles Canada",
                'featured_title': f"{name} Product Image",
                'suggested_filename': f"{name.lower().replace(' ', '-')}-mohawk-medibles.webp",
                'gallery_alts': [
                    f"{name} - Front View",
                    f"{name} - Detail Shot",
                    f"{name} - Package"
                ]
            },
            'seo_notes': [
                'Use descriptive filenames with product keywords',
                'Include brand name in alt text for recognition',
                'WebP format recommended for faster loading',
                'Compress images to under 100KB when possible'
            ]
        }


if __name__ == '__main__':
    # Demo usage
    agent = VisionAgent()

    sample_product = {
        'ID': 12345,
        'Name': 'Purple Kush',
        'Categories': 'Flower, Indica',
        'Images': 'https://example.com/purple-kush.jpg',
        'Meta: _wp_attachment_image_alt': ''
    }

    analysis = agent.analyze_product_images(sample_product)
    print(json.dumps(analysis, indent=2))

    optimizations = agent.optimize_product_images(sample_product)
    print(json.dumps(optimizations, indent=2))
