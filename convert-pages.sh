#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# convert-pages.sh — Convert old full-HTML pages to SPA fragments
# ═══════════════════════════════════════════════════════════════

PAGES_DIR="./pages"
BACKUP_DIR="./pages_backup_$(date +%s)"

echo "📦 Backing up original pages to $BACKUP_DIR..."
cp -r "$PAGES_DIR" "$BACKUP_DIR"

# Old-format pages to convert (skip already-converted new ones)
OLD_PAGES=(
    "8band-report.html"
    "aquacrop.html"
    "billboard-analytics.html"
    "use-case-flood.html"
    "use-case-jute.html"
    "use-case-rice.html"
    "use-case-vegetable.html"
)

for FILE in "${OLD_PAGES[@]}"; do
    PATH_FULL="$PAGES_DIR/$FILE"
    if [[ ! -f "$PATH_FULL" ]]; then
        echo "⚠️  Skipping $FILE (not found)"
        continue
    fi

    echo "🔄 Converting $FILE..."

    # Extract title
    TITLE=$(grep -oP '(?<=<title>)[^<]+' "$PATH_FULL" | head -1)

    # Extract description
    DESC=$(grep -oP '<meta name="description" content="\K[^"]+' "$PATH_FULL" | head -1)

    # Extract canonical
    CANON=$(grep -oP '<link rel="canonical" href="\K[^"]+' "$PATH_FULL" | head -1)

    # Extract everything between <body ...> and </body>
    BODY_CONTENT=$(awk '/<body[^>]*>/{flag=1; next} /<\/body>/{flag=0} flag' "$PATH_FULL")

    # Clean up: remove header slot, footer slot, script tags
    CLEANED=$(echo "$BODY_CONTENT" | sed \
        -e '/<div id="site-header"><\/div>/d' \
        -e '/<div id="site-footer"><\/div>/d' \
        -e '/<script src=.*include\.js.*<\/script>/d' \
        -e '/<script src=.*main\.js.*<\/script>/d' \
        -e 's|href="\.\./|href="/|g' \
        -e 's|src="\.\./|src="/|g' \
        -e 's|href="\.\./index\.html|href="/|g')

    # Write new SPA-format file
    {
        echo "<meta name=\"page:title\" content=\"$TITLE\">"
        echo "<meta name=\"page:description\" content=\"$DESC\">"
        echo "<meta name=\"page:canonical\" content=\"$CANON\">"
        echo ""
        echo "$CLEANED"
    } > "$PATH_FULL.new"

    mv "$PATH_FULL.new" "$PATH_FULL"
    echo "   ✅ $FILE → $(wc -l < $PATH_FULL) lines"
done

echo ""
echo "✅ Done! Backup saved in: $BACKUP_DIR"
echo "🔍 Check: cat pages/8band-report.html | head -20"
