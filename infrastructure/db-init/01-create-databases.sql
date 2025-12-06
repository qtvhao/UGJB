-- Database initialization script for Platform
-- Per ADR-002: Database per bounded context
--
-- This script creates separate databases for each bounded context service
-- following the microservices architecture pattern where each service
-- owns its data and schema independently.
--
-- Generated from services.json
-- Total services: 6
--
-- Security Notes:
--   - Each service should use a dedicated database user
--   - Grant only necessary permissions (CONNECT, CREATE, etc.)
--   - Consider using different users for read/write operations

-- Create databases for each service

-- Engineering-Analytics
CREATE DATABASE IF NOT EXISTS engineering_analytics_db;
GRANT ALL PRIVILEGES ON DATABASE engineering_analytics_db TO engineering_analytics_user;


-- Goal-Management
CREATE DATABASE IF NOT EXISTS goal_management_db;
GRANT ALL PRIVILEGES ON DATABASE goal_management_db TO goal_management_user;


-- HR-Management
CREATE DATABASE IF NOT EXISTS hr_management_db;
GRANT ALL PRIVILEGES ON DATABASE hr_management_db TO hr_management_user;


-- Project-Management
CREATE DATABASE IF NOT EXISTS project_management_db;
GRANT ALL PRIVILEGES ON DATABASE project_management_db TO project_management_user;


-- System-Integration
CREATE DATABASE IF NOT EXISTS system_integration_db;
GRANT ALL PRIVILEGES ON DATABASE system_integration_db TO system_integration_user;


-- Workforce-Wellbeing
CREATE DATABASE IF NOT EXISTS workforce_wellbeing_db;
GRANT ALL PRIVILEGES ON DATABASE workforce_wellbeing_db TO workforce_wellbeing_user;

