# Vegz Login Page

A simple responsive, frontend-only login page.

## Local preview

Open `login-page/index.html` in a browser, or run:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080/login-page/.

## GitHub Pages and domain

- The site is configured for the custom domain `login.vegz.online`.
- In your DNS provider, create a CNAME record: host `login`, target `Manojhole.github.io`.
- In GitHub, open **Settings → Pages** and set the build/deployment source to **GitHub Actions**.
- The workflow deploys the repository root, and the root page redirects to `/login-page/`.

## Important

This is only a frontend demonstration. It does not authenticate users or store credentials. Connect a secure backend/API before using it for real accounts.
