@echo off
REM ============================================
REM Addon Metrics Update Job - Windows Batch Script
REM ============================================
REM This script updates addon metrics automatically
REM Can be scheduled in Windows Task Scheduler
REM ============================================

echo ========================================
echo Addon Metrics Update Job
echo Started at: %date% %time%
echo ========================================

cd /d "%~dp0"

REM Run the update script
node src/jobs/updateAddonMetrics.js update

echo.
echo ========================================
echo Job completed at: %date% %time%
echo ========================================

REM Keep window open for 5 seconds to see results
timeout /t 5 /nobreak
