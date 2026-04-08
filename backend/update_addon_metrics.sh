#!/bin/bash
# ============================================
# Addon Metrics Update Job - Shell Script
# ============================================
# This script updates addon metrics automatically
# Can be scheduled via cron
# ============================================

echo "========================================"
echo "Addon Metrics Update Job"
echo "Started at: $(date)"
echo "========================================"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Run the update script
node src/jobs/updateAddonMetrics.js update

echo ""
echo "========================================"
echo "Job completed at: $(date)"
echo "========================================"
