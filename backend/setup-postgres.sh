#!/bin/bash

# PostgreSQL Setup Script for Commerzbank Application
echo "🐘 Setting up PostgreSQL for Commerzbank Application..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first:"
    echo "   sudo apt update && sudo apt install -y postgresql postgresql-contrib"
    exit 1
fi

# Start PostgreSQL service
echo "🔄 Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
echo "📊 Creating database and user..."
sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE commerzbank_db;

-- Create user (if not exists)
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'commerzbank_user') THEN
        CREATE USER commerzbank_user WITH PASSWORD 'secure_password_123';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE commerzbank_db TO commerzbank_user;
GRANT ALL ON SCHEMA public TO commerzbank_user;

-- Connect to the database and grant table privileges
\c commerzbank_db;
GRANT ALL ON ALL TABLES IN SCHEMA public TO commerzbank_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO commerzbank_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO commerzbank_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO commerzbank_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO commerzbank_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO commerzbank_user;

\q
EOF

echo "✅ Database setup complete!"
echo ""
echo "📋 Database Information:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: commerzbank_db"
echo "   User: commerzbank_user"
echo "   Password: secure_password_123"
echo ""
echo "🔗 Connection String:"
echo "   postgresql://commerzbank_user:secure_password_123@localhost:5432/commerzbank_db?schema=public"
echo ""
echo "📝 Next steps:"
echo "   1. Update your .env file with the connection string above"
echo "   2. Run: npx prisma migrate dev --name init"
echo "   3. Run: npx prisma generate"
echo "   4. Test the connection with your application"
