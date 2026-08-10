# 🔐 Login App

A full-stack login application with:
- **Frontend** — HTML/CSS/JS served by Nginx
- **Backend** — Python Flask REST API (Gunicorn)
- **Database** — MySQL 8 with bcrypt-hashed passwords

---

## 📁 Project Structure

```
login-app/
├── .env                  ← secrets & config (DO NOT commit)
├── .gitignore
│
├── frontend/
│   ├── index.html        ← login + welcome page (single-page)
│   ├── nginx.conf        ← serves files, proxies /api → backend
│   └── Dockerfile
│
├── backend/
│   ├── app.py            ← Flask API (login, register, health)
│   ├── requirements.txt
│   └── Dockerfile
│
└── mysql-init/
    ├── 01_init.sql       ← creates DB, table & seed user
    └── Dockerfile
```

---

## 🚀 Quick Start


```

### 3. Open in browser
```
http://localhost:8080
```

### 4. Default login
| Username | Password |
|----------|----------|
| `manoj`  | `admin`  |

---

## 🛠 API Endpoints

| Method | Path           | Body                          | Response                  |
|--------|---------------|-------------------------------|---------------------------|
| GET    | /api/health   | —                             | `{"status":"ok"}`         |
| POST   | /api/login    | `{"username":"","password":""}` | `{"success":true,"username":"..."}` |
| POST   | /api/register | `{"username":"","password":""}` | `{"success":true,"message":"..."}` |

---

## ⚙️ Configuration

All secrets live in `.env`. Edit before deploying:

| Variable              | Purpose                              |
|-----------------------|--------------------------------------|
| `MYSQL_ROOT_PASSWORD` | MySQL root password                  |
| `MYSQL_USER/PASSWORD` | App DB credentials                   |
| `FLASK_SECRET_KEY`    | Flask session signing key            |
| `BCRYPT_LOG_ROUNDS`   | Password hashing cost (default 12)   |
| `FRONTEND_PORT`       | Host port for the web UI (default 8080) |

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (never stored in plain text)
- `.env` is excluded from git via `.gitignore`
- Backend runs as a **non-root** user inside Docker
- Nginx acts as a reverse-proxy — the Flask port is not exposed in production
- Change `FLASK_SECRET_KEY` and all passwords before deploying publicly

