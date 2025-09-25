# PostgreSQL Setup Guide

This guide will help you migrate from SQLite to PostgreSQL for production use.

## 🚀 Quick Setup

### 1. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Run the Setup Script

```bash
cd backend
chmod +x setup-postgres.sh
./setup-postgres.sh
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Update Environment Variables

Create or update your `.env` file in the backend directory:

```env
# PostgreSQL Database Configuration
DATABASE_URL="postgresql://commerzbank_user:secure_password_123@localhost:5432/commerzbank_db?schema=public"
ADMIN_PASSWORD="admin123"

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=commerzbank_db
DB_USER=commerzbank_user
DB_PASSWORD=secure_password_123

# Production Settings
NODE_ENV=production
PORT=3001
```

### 5. Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### 6. Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

### 7. Migrate Existing Data

```bash
cd backend
node migrate-to-postgres.js
```

### 8. Test the Application

```bash
cd backend
npm start
```

## 🔧 Manual Setup (Alternative)

If the script doesn't work, you can set up PostgreSQL manually:

### 1. Create Database and User

```bash
sudo -u postgres psql
```

```sql
-- Create database
CREATE DATABASE commerzbank_db;

-- Create user
CREATE USER commerzbank_user WITH PASSWORD 'secure_password_123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE commerzbank_db TO commerzbank_user;

-- Connect to the database
\c commerzbank_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO commerzbank_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO commerzbank_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO commerzbank_user;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO commerzbank_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO commerzbank_user;

\q
```

## 📊 Database Information

- **Host**: localhost
- **Port**: 5432
- **Database**: commerzbank_db
- **User**: commerzbank_user
- **Password**: secure_password_123

## 🔗 Connection String

```
postgresql://commerzbank_user:secure_password_123@localhost:5432/commerzbank_db?schema=public
```

## 🛠️ Troubleshooting

### PostgreSQL Service Issues

```bash
# Check status
sudo systemctl status postgresql

# Start service
sudo systemctl start postgresql

# Restart service
sudo systemctl restart postgresql
```

### Connection Issues

```bash
# Test connection
psql -h localhost -U commerzbank_user -d commerzbank_db

# Check if PostgreSQL is listening
sudo netstat -tlnp | grep 5432
```

### Permission Issues

```bash
# Fix PostgreSQL permissions
sudo chown -R postgres:postgres /var/lib/postgresql/
sudo chmod 700 /var/lib/postgresql/*/main/
```

## 🔒 Security Considerations

1. **Change Default Password**: Update the password in production
2. **Use Environment Variables**: Never hardcode credentials
3. **Enable SSL**: Configure SSL for production
4. **Firewall**: Restrict database access
5. **Regular Backups**: Set up automated backups

## 📈 Production Recommendations

1. **Use Connection Pooling**: Consider using PgBouncer
2. **Monitoring**: Set up database monitoring
3. **Backups**: Implement automated backup strategy
4. **Replication**: Set up read replicas for scaling
5. **SSL**: Enable SSL connections

## 🎯 Next Steps

After successful migration:

1. Test all application features
2. Update your deployment configuration
3. Set up monitoring and logging
4. Configure automated backups
5. Update your CI/CD pipeline

## 📞 Support

If you encounter issues:

1. Check PostgreSQL logs: `sudo journalctl -u postgresql`
2. Verify connection string format
3. Ensure all dependencies are installed
4. Check firewall settings
