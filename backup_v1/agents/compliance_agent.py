#!/usr/bin/env python3
"""
Mohawk Medibles Compliance Agent v1.0
Canadian Cannabis Act Enforcement & Provincial Rules
"""

import json
import re
from typing import Dict, List, Tuple
from datetime import datetime

class ComplianceAgent:
    """Ensures all content complies with Canadian Cannabis Act regulations."""
    
    # 33 Prohibited terms under Canadian Cannabis Act
    PROHIBITED_TERMS = [
        'cure', 'cures', 'treat', 'treats', 'treatment',
        'heal', 'heals', 'healing', 'miracle', 'guaranteed',
        'risk-free', 'safe for everyone', 'no side effects',
        'doctor recommended', 'clinically proven', 'FDA approved',
        'Health Canada approved', 'medical grade', 'prescription strength',
        'addictive', 'non-addictive', 'harmless', 'completely safe',
        'youth', 'minor', 'teen', 'children', 'kid',
        'celebrity', 'athlete endorsement', 'influencer',
        'glamorous', 'sexy', 'cool', 'popular',
        'weight loss', 'performance enhancing'
    ]
    
    # Required disclaimers
    REQUIRED_DISCLAIMERS = {
        'age': 'Must be 19+ to purchase',
        'medical': 'Consult healthcare provider',
        'effects': 'Effects may vary by individual'
    }
    
    # Provincial shipping restrictions
    PROVINCIAL_RULES = {
        'ON': {'min_age': 19, 'max_thc_edible': 10, 'shipping': True},
        'BC': {'min_age': 19, 'max_thc_edible': 10, 'shipping': True},
        'AB': {'min_age': 18, 'max_thc_edible': 10, 'shipping': True},
        'SK': {'min_age': 19, 'max_thc_edible': 10, 'shipping': True},
        'MB': {'min_age': 19, 'max_thc_edible': 10, 'shipping': True},
        'QC': {'min_age': 21, 'max_thc_edible': 10, 'shipping': False, 'note': 'Quebec restricts out-of-province sales'},
        'NB': {'min_age': 19, 'max_thc_edible': 10, 'shipping': True},
        'NS': {'min_age': 19, 'max_thc_edible': 10, 'shipping': True},
        'PE': {'min_age': 19, 'max_thc_edible': 10, 'shipping': True},
        'NL': {'min_age': 19, 'max_thc_edible': 10, 'shipping': True},
        'YT': {'min_age': 19, 'max_thc_edible': 10, 'shipping': True},
        'NT': {'min_age': 19, 'max_thc_edible': 10, 'shipping': True},
        'NU': {'min_age': 19, 'max_thc_edible': 10, 'shipping': True}
    }
    
    # Health claim patterns to detect
    HEALTH_CLAIM_PATTERNS = [
        r'\b(cure|treat|heal)s?\s+(cancer|diabetes|anxiety|depression|pain)',
        r'\b(proven|guaranteed)\s+to\s+(work|help|relieve)',
        r'\b(eliminates?|removes?)\s+(symptoms?|pain|anxiety)',
        r'\bno\s+side\s+effects?\b',
        r'\b100%\s+(safe|effective|natural)\b',
        r'\bdoctor\s+(recommended|approved)\b'
    ]
    
    # Approved educational phrases
    APPROVED_PHRASES = [
        'may help with', 'some users report', 'traditionally used for',
        'consult your healthcare provider', 'effects vary by individual',
        'start low and go slow', 'responsible consumption',
        'for adult use only', 'keep out of reach of children'
    ]
    
    def __init__(self):
        self.violation_log = []
        
    def scan_product(self, product: Dict) -> Dict:
        """Comprehensive compliance scan of a product."""
        results = {
            'product_id': product.get('ID', 'unknown'),
            'product_name': product.get('Name', ''),
            'scan_timestamp': datetime.now().isoformat(),
            'compliant': True,
            'violations': [],
            'warnings': [],
            'recommendations': []
        }
        
        # Scan all text fields
        text_fields = [
            ('Name', product.get('Name', '')),
            ('Description', product.get('Description', '')),
            ('Short description', product.get('Short description', '')),
            ('Meta: _yoast_wpseo_metadesc', product.get('Meta: _yoast_wpseo_metadesc', '')),
            ('Tags', product.get('Tags', ''))
        ]
        
        for field_name, content in text_fields:
            if content:
                field_results = self._scan_text(content, field_name)
                results['violations'].extend(field_results['violations'])
                results['warnings'].extend(field_results['warnings'])
        
        # Check for required elements
        missing_elements = self._check_required_elements(product)
        results['warnings'].extend(missing_elements)
        
        # Check THC content for edibles
        if self._is_edible(product):
            thc_check = self._check_edible_thc(product)
            if thc_check:
                results['violations'].append(thc_check)
        
        # Determine overall compliance
        results['compliant'] = len(results['violations']) == 0
        
        # Generate recommendations
        results['recommendations'] = self._generate_recommendations(results)
        
        # Calculate compliance score
        results['compliance_score'] = self._calculate_score(results)
        
        return results
    
    def _scan_text(self, text: str, field_name: str) -> Dict:
        """Scan text for prohibited terms and health claims."""
        violations = []
        warnings = []
        
        text_lower = text.lower()
        
        # Check prohibited terms
        for term in self.PROHIBITED_TERMS:
            if term.lower() in text_lower:
                violations.append({
                    'type': 'PROHIBITED_TERM',
                    'field': field_name,
                    'term': term,
                    'severity': 'HIGH',
                    'message': f'Prohibited term "{term}" found in {field_name}'
                })
        
        # Check health claim patterns
        for pattern in self.HEALTH_CLAIM_PATTERNS:
            matches = re.findall(pattern, text_lower)
            if matches:
                violations.append({
                    'type': 'HEALTH_CLAIM',
                    'field': field_name,
                    'pattern': pattern,
                    'matches': matches,
                    'severity': 'CRITICAL',
                    'message': f'Potential health claim detected in {field_name}'
                })
        
        # Check for youth-appealing content
        youth_terms = ['candy-like', 'fun', 'party', 'cartoon', 'colorful packaging']
        for term in youth_terms:
            if term in text_lower:
                warnings.append({
                    'type': 'YOUTH_APPEAL',
                    'field': field_name,
                    'term': term,
                    'severity': 'MEDIUM',
                    'message': f'Potentially youth-appealing term "{term}" in {field_name}'
                })
        
        # Check for missing disclaimers in description
        if field_name == 'Description' and len(text) > 100:
            has_disclaimer = any(phrase in text_lower for phrase in [
                'consult', 'healthcare', '19+', 'adult', 'responsible'
            ])
            if not has_disclaimer:
                warnings.append({
                    'type': 'MISSING_DISCLAIMER',
                    'field': field_name,
                    'severity': 'LOW',
                    'message': 'Consider adding responsible use disclaimer'
                })
        
        return {'violations': violations, 'warnings': warnings}
    
    def _check_required_elements(self, product: Dict) -> List[Dict]:
        """Check for required compliance elements."""
        warnings = []
        
        # Check for age restriction mention
        description = product.get('Description', '').lower()
        if '19+' not in description and 'adult' not in description:
            warnings.append({
                'type': 'MISSING_AGE_RESTRICTION',
                'severity': 'MEDIUM',
                'message': 'Add age restriction notice (19+ or adult use only)'
            })
        
        # Check for THC/CBD content declaration
        thc = product.get('Meta: thc_content', '')
        cbd = product.get('Meta: cbd_content', '')
        if not thc and not cbd:
            warnings.append({
                'type': 'MISSING_CANNABINOID_INFO',
                'severity': 'LOW',
                'message': 'Add THC/CBD content information'
            })
        
        return warnings
    
    def _is_edible(self, product: Dict) -> bool:
        """Determine if product is an edible."""
        categories = product.get('Categories', '').lower()
        name = product.get('Name', '').lower()
        
        edible_keywords = ['edible', 'gummy', 'gummies', 'chocolate', 'candy', 'beverage', 'drink', 'cookie', 'brownie']
        return any(kw in categories or kw in name for kw in edible_keywords)
    
    def _check_edible_thc(self, product: Dict) -> Dict:
        """Check if edible THC content exceeds 10mg limit."""
        name = product.get('Name', '')
        description = product.get('Description', '')
        
        # Try to extract THC amount
        thc_pattern = r'(\d+)\s*mg\s*(thc|THC)'
        
        for text in [name, description]:
            matches = re.findall(thc_pattern, text)
            for match in matches:
                thc_mg = int(match[0])
                if thc_mg > 10:
                    return {
                        'type': 'EDIBLE_THC_LIMIT',
                        'severity': 'CRITICAL',
                        'thc_detected': thc_mg,
                        'limit': 10,
                        'message': f'Edible THC ({thc_mg}mg) exceeds 10mg per package limit'
                    }
        
        return None
    
    def _generate_recommendations(self, results: Dict) -> List[str]:
        """Generate compliance recommendations."""
        recommendations = []
        
        for violation in results['violations']:
            if violation['type'] == 'PROHIBITED_TERM':
                term = violation['term']
                if term in ['cure', 'cures', 'treat', 'treats']:
                    recommendations.append(f'Replace "{term}" with "may help with" or "traditionally used for"')
                elif term in ['guaranteed', 'proven']:
                    recommendations.append(f'Replace "{term}" with "some users report" or "effects vary"')
                else:
                    recommendations.append(f'Remove prohibited term "{term}"')
            
            elif violation['type'] == 'HEALTH_CLAIM':
                recommendations.append('Rewrite to use educational language only. Avoid specific medical claims.')
            
            elif violation['type'] == 'EDIBLE_THC_LIMIT':
                recommendations.append('Ensure edible products comply with 10mg THC per package limit')
        
        for warning in results['warnings']:
            if warning['type'] == 'MISSING_AGE_RESTRICTION':
                recommendations.append('Add "For adults 19+ only" to product description')
            elif warning['type'] == 'MISSING_DISCLAIMER':
                recommendations.append('Add "Consult healthcare provider before use" disclaimer')
        
        return recommendations
    
    def _calculate_score(self, results: Dict) -> int:
        """Calculate compliance score (0-100)."""
        score = 100
        
        # Deduct for violations
        for violation in results['violations']:
            if violation.get('severity') == 'CRITICAL':
                score -= 30
            elif violation.get('severity') == 'HIGH':
                score -= 20
            else:
                score -= 10
        
        # Deduct for warnings (less severe)
        for warning in results['warnings']:
            if warning.get('severity') == 'MEDIUM':
                score -= 5
            else:
                score -= 2
        
        return max(score, 0)
    
    def fix_content(self, text: str) -> Tuple[str, List[str]]:
        """Automatically fix compliance issues in text."""
        fixed_text = text
        changes = []
        
        # Replace prohibited terms with compliant alternatives
        replacements = {
            'cures': 'may help with',
            'cure': 'may help with',
            'treats': 'traditionally used for',
            'treat': 'traditionally used for',
            'heals': 'supports',
            'heal': 'supports',
            'guaranteed': 'quality-tested',
            'proven': 'reported by users',
            'no side effects': 'effects vary by individual',
            'completely safe': 'for responsible adult use',
            'miracle': 'premium',
            'risk-free': 'quality-assured'
        }
        
        for old, new in replacements.items():
            if old.lower() in fixed_text.lower():
                # Case-insensitive replacement
                pattern = re.compile(re.escape(old), re.IGNORECASE)
                fixed_text = pattern.sub(new, fixed_text)
                changes.append(f'Replaced "{old}" with "{new}"')
        
        return fixed_text, changes
    
    def generate_compliant_description(self, product: Dict) -> str:
        """Generate a fully compliant product description."""
        name = product.get('Name', 'Cannabis Product')
        categories = product.get('Categories', '').split(',')[0] if product.get('Categories') else 'Cannabis'
        strain_type = 'Hybrid'
        
        # Detect strain type
        name_lower = name.lower()
        cat_lower = categories.lower()
        if 'indica' in name_lower or 'indica' in cat_lower:
            strain_type = 'Indica'
        elif 'sativa' in name_lower or 'sativa' in cat_lower:
            strain_type = 'Sativa'
        
        # V3.0 Compliant Template
        template = f"""{name} - {categories} - {strain_type}

**Product Focus (70%):** {name} is a premium {strain_type.lower()} product featuring quality genetics, lab-tested potency, and carefully curated terpene profiles for an optimal experience.

**Medical Benefits (12%):** Some users report this product may help with relaxation and general wellness. Effects vary by individual. Consult your healthcare provider before use, especially if taking medications.

**Recreational Benefits (12%):** Ideal for adult recreational use. Start with a low dose and wait to assess effects. Best enjoyed responsibly in a comfortable setting.

**Indigenous Heritage (3%):** Proudly offered from Tyendinaga Mohawk Territory, supporting Indigenous business ownership.

**Business Information (3%):** Lab-tested for quality assurance. Canada-wide shipping available. For adults 19+ only."""
        
        return template
    
    def batch_scan(self, products: List[Dict]) -> Dict:
        """Scan multiple products and generate summary report."""
        results = {
            'scan_timestamp': datetime.now().isoformat(),
            'total_products': len(products),
            'compliant': 0,
            'non_compliant': 0,
            'violations_by_type': {},
            'critical_issues': [],
            'products': []
        }
        
        for product in products:
            scan = self.scan_product(product)
            results['products'].append(scan)
            
            if scan['compliant']:
                results['compliant'] += 1
            else:
                results['non_compliant'] += 1
                
                # Track critical issues
                for v in scan['violations']:
                    if v.get('severity') == 'CRITICAL':
                        results['critical_issues'].append({
                            'product': product.get('Name', 'Unknown'),
                            'violation': v
                        })
                    
                    # Count by type
                    v_type = v.get('type', 'OTHER')
                    results['violations_by_type'][v_type] = results['violations_by_type'].get(v_type, 0) + 1
        
        results['compliance_rate'] = round(results['compliant'] / len(products) * 100, 1) if products else 0
        
        return results


if __name__ == '__main__':
    agent = ComplianceAgent()
    
    # Test with sample product
    test_product = {
        'ID': 123,
        'Name': 'Healing Indica Gummies 50mg',
        'Description': 'These gummies cure anxiety and treat insomnia. Guaranteed results!',
        'Categories': 'Edibles'
    }
    
    results = agent.scan_product(test_product)
    print(json.dumps(results, indent=2))
    
    # Test fix
    fixed, changes = agent.fix_content(test_product['Description'])
    print(f"\nFixed: {fixed}")
    print(f"Changes: {changes}")
