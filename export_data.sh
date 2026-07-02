#!/bin/bash
# Script to safely export your local database so you can move it to Hostinger

echo "Exporting your local Stocks Database..."
# This will dump the data into a file called 'stocks_db_backup.sql'
PGPASSWORD="SECURE" pg_dump -U postgres -h localhost -d stocks_db -F p -f stocks_db_backup.sql

echo "=========================================="
echo "✅ Export Complete!"
echo "Your data has been saved to: stocks_db_backup.sql"
echo ""
echo "To migrate this to your Hostinger server, simply:"
echo "1. Upload this file to Hostinger (e.g. using scp or sftp)"
echo "2. On Hostinger, run this command to import it:"
echo "   sudo -u postgres psql -d stocks_db -f stocks_db_backup.sql"
echo "=========================================="
