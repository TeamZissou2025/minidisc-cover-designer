#!/bin/bash
# Check if v0.3.7e is live

echo "🔍 Checking deployment status..."
echo ""

VERSION=$(curl -s https://minidisc.squirclelabs.uk | grep -oP 'v0\.3\.\d+[a-z]?' | head -1)

if [ "$VERSION" == "v0.3.7e" ]; then
    echo "✅ SUCCESS! Site is on v0.3.7e"
    echo ""
    echo "🎉 Title auto-scaling is now live!"
    echo ""
    echo "Test it:"
    echo "1. Visit: https://minidisc.squirclelabs.uk"
    echo "2. Hard refresh: Ctrl+Shift+R"
    echo "3. Search: 'Life Aquatic Soundtrack'"
    echo "4. Open Console (F12)"
    echo "5. Look for: '✅ Title scaled to 2.1mm to fit'"
else
    echo "⏳ Still deploying... Current version: $VERSION"
    echo ""
    echo "Expected: v0.3.7e"
    echo "Wait 30 seconds and run this script again."
    echo ""
    echo "Or check Vercel dashboard:"
    echo "https://vercel.com/teamzissou2025s-projects/minidisc-cover-designer/deployments"
fi

echo ""
echo "Deployment timeline:"
echo "├─ Git push: Done ✅"
echo "├─ Vercel build: ~90 seconds ⏱️"
echo "├─ CDN deploy: ~30 seconds ⏱️"
echo "└─ Total: ~2-3 minutes ⏱️"
