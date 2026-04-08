@echo off
set PGPASSWORD=postgres
psql -U postgres -d ebookingsam -c "SELECT * FROM tour_statistics WHERE tour_id = 81;" -q
