@echo off
echo ============================================================================
echo Running Tour Rating Synchronization Migration
echo ============================================================================
set PGPASSWORD=postgres
psql -U postgres -d ebookingsam -f sync_tour_ratings_trigger.sql
echo.
echo ============================================================================
echo Migration completed!
echo ============================================================================
pause
