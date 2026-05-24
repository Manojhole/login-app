# ============================================================
#  Dockerfile  —  MySQL 8
# ============================================================
FROM mysql:8.4

# Copy init SQL scripts — runs alphabetically on first startup
COPY 01_init.sql /docker-entrypoint-initdb.d/01_init.sql

EXPOSE 3306
