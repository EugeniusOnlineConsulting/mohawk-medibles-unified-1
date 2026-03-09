#!/bin/bash
# Quick SSH connection test for Mohawk Medibles

echo "Testing SSH connection to Mohawk Medibles..."
echo ""

# Test key exists
if [ -f "$HOME/.ssh/wpengine_ed25519" ]; then
    echo "✅ SSH key found: $HOME/.ssh/wpengine_ed25519"
else
    echo "❌ SSH key NOT found at: $HOME/.ssh/wpengine_ed25519"
    echo "   Please ensure the key is in place"
    exit 1
fi

# Test staging connection
echo ""
echo "Testing STAGING connection..."
if ssh -i "$HOME/.ssh/wpengine_ed25519" -o ConnectTimeout=10 -o StrictHostKeyChecking=no \
    mohawkmedibstg@mohawkmedibstg.ssh.wpengine.net "cd /sites/mohawkmedibstg && wp --version" 2>/dev/null; then
    echo "✅ STAGING: Connected successfully"
else
    echo "❌ STAGING: Connection failed"
fi

# Test production connection
echo ""
echo "Testing PRODUCTION connection..."
if ssh -i "$HOME/.ssh/wpengine_ed25519" -o ConnectTimeout=10 -o StrictHostKeyChecking=no \
    mohawkmedibles@mohawkmedibles.ssh.wpengine.net "cd /sites/mohawkmedibles && wp --version" 2>/dev/null; then
    echo "✅ PRODUCTION: Connected successfully"
else
    echo "❌ PRODUCTION: Connection failed"
fi

echo ""
echo "If connections failed, you may need to:"
echo "1. Run this from your LOCAL MACHINE (not in VM)"
echo "2. Ensure SSH key has correct permissions: chmod 600 ~/.ssh/wpengine_ed25519"
echo "3. Verify key is added to WP Engine account"
