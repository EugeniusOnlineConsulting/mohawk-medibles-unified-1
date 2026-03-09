#!/usr/bin/env python3
"""
Mohawk Medibles SEO Agent v1.0
8-Dimensional SEO Analysis with V3.0 Content Framework
"""

import json
import re
from typing import Dict, List, Optional
from pathlib import Path

class SEOAgent:
    """Advanced SEO optimization agent for cannabis e-commerce."""
    
    # V3.0 Content Framework - EXACT percentages
    CONTENT_BALANCE = {
        'product_focus': 70,
        'medical_benefits': 12,
        'recreational_benefits': 12,
        'indigenous_heritage': 3,
        'business_info': 3
    }
    
    # LSI Keywords by category
    LSI_KEYWORDS = {
        'flower': ['cannabis flower', 'dried flower', 'premium buds', 'craft cannabis', 'hand-trimmed'],
        'edibles': ['cannabis edibles', 'THC gummies', 'infused treats', 'micro-dose', 'full-spectrum'],
        'concentrates': ['cannabis concentrates', 'live resin', 'shatter', 'wax', 'dabs'],
        'vapes': ['vape cartridge', 'cannabis vaporizer', '510 thread', 'disposable vape'],
        'indica': ['relaxing strain', 'body high', 'evening use', 'sleep aid', 'pain relief'],
        'sativa': ['energizing strain', 'cerebral high', 'daytime use', 'creativity boost'],
        'hybrid': ['balanced effects', 'versatile strain', 'mixed genetics']
    }
    
    # Target keyword density range
    KEYWORD_DENSITY_MIN = 1.0
    KEYWORD_DENSITY_MAX = 2.5
    
    def __init__(self, config_path: str = None):
        self.config = self._load_config(config_path)
        
    def _load_config(self, config_path: str) -> Dict:
        if config_path and Path(config_path).exists():
            with open(config_path) as f:
                return json.load(f)
        return {}
    
    def analyze_product(self, product: Dict) -> Dict:
        """Perform 8-dimensional SEO analysis on a product."""
        analysis = {
            'product_id': product.get('ID', 'unknown'),
            'product_name': product.get('Name', ''),
            'dimensions': {}
        }
        
        # 1. Title Optimization
        analysis['dimensions']['title'] = self._analyze_title(product)
        
        # 2. Meta Description
        analysis['dimensions']['meta_description'] = self._analyze_meta(product)
        
        # 3. Keyword Density
        analysis['dimensions']['keyword_density'] = self._analyze_keyword_density(product)
        
        # 4. Content Balance (V3.0 Framework)
        analysis['dimensions']['content_balance'] = self._analyze_content_balance(product)
        
        # 5. LSI Keywords
        analysis['dimensions']['lsi_keywords'] = self._analyze_lsi(product)
        
        # 6. Internal Linking Potential
        analysis['dimensions']['internal_links'] = self._analyze_internal_links(product)
        
        # 7. Schema Readiness
        analysis['dimensions']['schema'] = self._analyze_schema_readiness(product)
        
        # 8. Mobile Optimization
        analysis['dimensions']['mobile'] = self._analyze_mobile_readiness(product)
        
        # Calculate overall score
        analysis['overall_score'] = self._calculate_overall_score(analysis['dimensions'])
        analysis['priority'] = self._determine_priority(analysis['overall_score'])
        
        return analysis
    
    def _analyze_title(self, product: Dict) -> Dict:
        name = product.get('Name', '')
        seo_title = product.get('Meta: _yoast_wpseo_title', '')
        
        score = 0
        issues = []
        recommendations = []
        
        # Check length
        title_len = len(seo_title) if seo_title else len(name)
        if 50 <= title_len <= 60:
            score += 30
        elif 40 <= title_len <= 70:
            score += 20
            recommendations.append('Optimize title length to 50-60 characters')
        else:
            issues.append(f'Title length ({title_len}) outside optimal range')
            recommendations.append('Adjust title to 50-60 characters')
        
        # Check for brand
        if 'Mohawk Medibles' in str(seo_title):
            score += 20
        else:
            recommendations.append('Add "Mohawk Medibles" brand to title')
        
        # Check for category
        categories = product.get('Categories', '')
        if categories and any(cat.lower() in str(seo_title).lower() for cat in str(categories).split(',')):
            score += 25
        else:
            recommendations.append('Include product category in title')
        
        # Check for product name
        if name.split()[0].lower() in str(seo_title).lower():
            score += 25
        
        return {
            'score': min(score, 100),
            'current_title': seo_title or name,
            'issues': issues,
            'recommendations': recommendations
        }
    
    def _analyze_meta(self, product: Dict) -> Dict:
        meta = product.get('Meta: _yoast_wpseo_metadesc', '')
        
        score = 0
        issues = []
        recommendations = []
        
        if not meta:
            issues.append('Missing meta description')
            recommendations.append('Create compelling 150-160 character meta description')
            return {'score': 0, 'issues': issues, 'recommendations': recommendations}
        
        # Length check
        meta_len = len(meta)
        if 150 <= meta_len <= 160:
            score += 40
        elif 120 <= meta_len <= 180:
            score += 25
            recommendations.append('Optimize meta to 150-160 characters')
        else:
            issues.append(f'Meta length ({meta_len}) not optimal')
        
        # Call to action
        cta_words = ['discover', 'shop', 'buy', 'order', 'try', 'experience']
        if any(word in meta.lower() for word in cta_words):
            score += 30
        else:
            recommendations.append('Add call-to-action to meta description')
        
        # Indigenous mention (subtle, 3% balance)
        if 'indigenous' in meta.lower() or 'mohawk' in meta.lower():
            score += 15
        
        # Canada mention for local SEO
        if 'canada' in meta.lower():
            score += 15
        else:
            recommendations.append('Include "Canada" for local SEO')
        
        return {
            'score': min(score, 100),
            'current_meta': meta,
            'length': meta_len,
            'issues': issues,
            'recommendations': recommendations
        }
    
    def _analyze_keyword_density(self, product: Dict) -> Dict:
        description = product.get('Description', '')
        name = product.get('Name', '')
        focus_kw = product.get('Meta: _yoast_wpseo_focuskw', '')
        
        if not description:
            return {'score': 0, 'density': 0, 'issues': ['No description content']}
        
        # Calculate density
        words = description.lower().split()
        word_count = len(words)
        
        target_keyword = focus_kw.lower() if focus_kw else name.lower().split()[0]
        keyword_count = description.lower().count(target_keyword)
        
        density = (keyword_count / word_count * 100) if word_count > 0 else 0
        
        score = 0
        issues = []
        recommendations = []
        
        if self.KEYWORD_DENSITY_MIN <= density <= self.KEYWORD_DENSITY_MAX:
            score = 100
        elif density < self.KEYWORD_DENSITY_MIN:
            score = 50
            recommendations.append(f'Increase keyword density from {density:.1f}% to 1-2.5%')
        else:
            score = 30
            issues.append(f'Keyword stuffing detected ({density:.1f}%)')
            recommendations.append('Reduce keyword density to avoid penalties')
        
        return {
            'score': score,
            'density': round(density, 2),
            'target_keyword': target_keyword,
            'word_count': word_count,
            'issues': issues,
            'recommendations': recommendations
        }
    
    def _analyze_content_balance(self, product: Dict) -> Dict:
        """Analyze content against V3.0 Framework (70/12/12/3/3)."""
        description = product.get('Description', '')
        
        if not description:
            return {'score': 0, 'issues': ['No description to analyze']}
        
        # Detect content sections
        sections = {
            'product_focus': self._detect_product_content(description),
            'medical_benefits': self._detect_medical_content(description),
            'recreational_benefits': self._detect_recreational_content(description),
            'indigenous_heritage': self._detect_indigenous_content(description),
            'business_info': self._detect_business_content(description)
        }
        
        total = sum(sections.values())
        if total == 0:
            return {'score': 0, 'issues': ['Unable to parse content sections']}
        
        # Calculate percentages
        percentages = {k: (v/total*100) for k, v in sections.items()}
        
        # Score based on deviation from targets
        score = 100
        issues = []
        recommendations = []
        
        for section, target in self.CONTENT_BALANCE.items():
            actual = percentages.get(section, 0)
            deviation = abs(actual - target)
            
            if deviation > 10:
                score -= 20
                issues.append(f'{section}: {actual:.0f}% (target: {target}%)')
            elif deviation > 5:
                score -= 10
                recommendations.append(f'Adjust {section} from {actual:.0f}% to {target}%')
        
        return {
            'score': max(score, 0),
            'current_balance': {k: round(v, 1) for k, v in percentages.items()},
            'target_balance': self.CONTENT_BALANCE,
            'issues': issues,
            'recommendations': recommendations
        }
    
    def _detect_product_content(self, text: str) -> int:
        keywords = ['thc', 'cbd', 'potency', 'strain', 'terpene', 'genetics', 'flavor', 'aroma', 'quality', 'lab-tested', 'premium']
        return sum(1 for kw in keywords if kw in text.lower())
    
    def _detect_medical_content(self, text: str) -> int:
        keywords = ['therapeutic', 'relief', 'medical', 'pain', 'anxiety', 'sleep', 'dosage', 'healthcare']
        return sum(1 for kw in keywords if kw in text.lower())
    
    def _detect_recreational_content(self, text: str) -> int:
        keywords = ['recreational', 'enjoy', 'social', 'relax', 'creative', 'experience', 'leisure']
        return sum(1 for kw in keywords if kw in text.lower())
    
    def _detect_indigenous_content(self, text: str) -> int:
        keywords = ['indigenous', 'mohawk', 'tyendinaga', 'territory', 'traditional', 'ancestral']
        return sum(1 for kw in keywords if kw in text.lower())
    
    def _detect_business_content(self, text: str) -> int:
        keywords = ['shipping', 'delivery', 'support', 'guarantee', 'canada-wide', 'order', 'customer']
        return sum(1 for kw in keywords if kw in text.lower())
    
    def _analyze_lsi(self, product: Dict) -> Dict:
        description = product.get('Description', '')
        categories = product.get('Categories', '').lower()
        
        relevant_lsi = []
        for category, keywords in self.LSI_KEYWORDS.items():
            if category in categories:
                relevant_lsi.extend(keywords)
        
        if not relevant_lsi:
            relevant_lsi = self.LSI_KEYWORDS.get('flower', [])
        
        found = [kw for kw in relevant_lsi if kw.lower() in description.lower()]
        missing = [kw for kw in relevant_lsi if kw.lower() not in description.lower()]
        
        coverage = len(found) / len(relevant_lsi) * 100 if relevant_lsi else 0
        
        return {
            'score': min(coverage, 100),
            'found_keywords': found,
            'suggested_additions': missing[:5],
            'coverage_percent': round(coverage, 1)
        }
    
    def _analyze_internal_links(self, product: Dict) -> Dict:
        description = product.get('Description', '')
        
        # Check for existing links
        link_pattern = r'<a[^>]*href=["\'][^"\']*["\'][^>]*>'
        links = re.findall(link_pattern, description)
        
        score = min(len(links) * 25, 100)
        
        recommendations = []
        if len(links) < 2:
            recommendations.append('Add 2-3 internal links to related products')
        if len(links) < 1:
            recommendations.append('Add link to category page')
        
        return {
            'score': score,
            'link_count': len(links),
            'recommendations': recommendations
        }
    
    def _analyze_schema_readiness(self, product: Dict) -> Dict:
        schema_fields = [
            ('Meta: brand_name', 'Brand'),
            ('Meta: thc_content', 'THC Content'),
            ('Meta: cbd_content', 'CBD Content'),
            ('Meta: strain_type', 'Strain Type'),
            ('Regular price', 'Price'),
            ('SKU', 'SKU')
        ]
        
        present = []
        missing = []
        
        for field, name in schema_fields:
            if product.get(field):
                present.append(name)
            else:
                missing.append(name)
        
        score = len(present) / len(schema_fields) * 100
        
        return {
            'score': round(score),
            'present_fields': present,
            'missing_fields': missing,
            'recommendations': [f'Add {f} for schema markup' for f in missing[:3]]
        }
    
    def _analyze_mobile_readiness(self, product: Dict) -> Dict:
        description = product.get('Description', '')
        short_desc = product.get('Short description', '')
        
        score = 50  # Base score
        recommendations = []
        
        # Short description for mobile
        if short_desc and 50 <= len(short_desc) <= 150:
            score += 25
        else:
            recommendations.append('Optimize short description (50-150 chars) for mobile')
        
        # Description length reasonable for mobile
        if description and len(description) <= 1500:
            score += 25
        elif description:
            recommendations.append('Consider shorter description for mobile users')
        
        return {
            'score': min(score, 100),
            'short_desc_length': len(short_desc) if short_desc else 0,
            'desc_length': len(description) if description else 0,
            'recommendations': recommendations
        }
    
    def _calculate_overall_score(self, dimensions: Dict) -> int:
        weights = {
            'title': 0.15,
            'meta_description': 0.15,
            'keyword_density': 0.15,
            'content_balance': 0.20,
            'lsi_keywords': 0.10,
            'internal_links': 0.10,
            'schema': 0.10,
            'mobile': 0.05
        }
        
        total = 0
        for dim, weight in weights.items():
            if dim in dimensions:
                total += dimensions[dim].get('score', 0) * weight
        
        return round(total)
    
    def _determine_priority(self, score: int) -> str:
        if score >= 80:
            return 'LOW'
        elif score >= 60:
            return 'MEDIUM'
        elif score >= 40:
            return 'HIGH'
        else:
            return 'CRITICAL'
    
    def generate_optimized_content(self, product: Dict, analysis: Dict) -> Dict:
        """Generate optimized content based on analysis."""
        name = product.get('Name', '')
        categories = product.get('Categories', '')
        
        # Generate optimized title
        optimized_title = f"{name} - {categories.split(',')[0] if categories else 'Cannabis'} | Mohawk Medibles"
        if len(optimized_title) > 60:
            optimized_title = f"{name} | Mohawk Medibles"
        
        # Generate optimized meta
        optimized_meta = f"Discover {name} at Mohawk Medibles. Premium quality cannabis from Tyendinaga Mohawk Territory. Lab-tested, Canada-wide shipping."
        if len(optimized_meta) > 160:
            optimized_meta = optimized_meta[:157] + '...'
        
        # Generate focus keyphrase
        focus_kw = f"{name.lower().replace(' ', '-')} canada"
        
        return {
            'seo_title': optimized_title,
            'meta_description': optimized_meta,
            'focus_keyphrase': focus_kw,
            'suggested_tags': self._generate_tags(product)
        }
    
    def _generate_tags(self, product: Dict) -> List[str]:
        name = product.get('Name', '').lower()
        categories = product.get('Categories', '').lower()
        
        tags = [
            name.replace(' ', '-'),
            'lab-tested',
            'indigenous-owned',
            'canada-wide-shipping',
            'premium-cannabis'
        ]
        
        if 'indica' in name or 'indica' in categories:
            tags.extend(['indica', 'relaxing', 'evening-strain'])
        elif 'sativa' in name or 'sativa' in categories:
            tags.extend(['sativa', 'energizing', 'daytime-strain'])
        else:
            tags.extend(['hybrid', 'balanced-effects'])
        
        return tags[:12]


if __name__ == '__main__':
    # Demo usage
    agent = SEOAgent()
    
    sample_product = {
        'ID': 12345,
        'Name': 'Purple Kush',
        'Categories': 'Flower, Indica',
        'Description': 'Premium Purple Kush indica strain with deep relaxation effects.',
        'Meta: _yoast_wpseo_title': '',
        'Meta: _yoast_wpseo_metadesc': '',
        'Regular price': 45.00,
        'SKU': 'PK-001'
    }
    
    analysis = agent.analyze_product(sample_product)
    print(json.dumps(analysis, indent=2))
