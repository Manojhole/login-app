# Vegz Frontend Applications

Five independent Node.js/Express frontend demos in one repository. Each app has its own Dockerfile, package.json, static frontend, and health endpoint.

| App | Directory | Port | Hostname |
|---|---|---:|---|
| Login | login-page/ | 3000 | login.vegz.online |
| Signup | signup-page/ | 3001 | signup.vegz.online |
| Dashboard | dashboard-page/ | 3002 | dashboard.vegz.online |
| Contact | contact-page/ | 3003 | contact.vegz.online |
| Profile | profile-page/ | 3004 | profile.vegz.online |

Demo limitation: these are frontend-only examples. Forms show demo messages and do not authenticate users, send contact messages, save profile changes, or store data. Do not enter real passwords or sensitive information.

## Run locally
Example for the dashboard; repeat from the other app directories:
~~~sh
cd dashboard-page
npm install
npm start
~~~
Open http://localhost:3002. Ports for all apps are listed above.

## Build and run with Docker
~~~sh
docker build -t vegz-login ./login-page
docker build -t vegz-signup ./signup-page
docker build -t vegz-dashboard ./dashboard-page
docker build -t vegz-contact ./contact-page
docker build -t vegz-profile ./profile-page

docker run -d --restart unless-stopped --name vegz-login -p 3000:3000 vegz-login
docker run -d --restart unless-stopped --name vegz-signup -p 3001:3001 vegz-signup
docker run -d --restart unless-stopped --name vegz-dashboard -p 3002:3002 vegz-dashboard
docker run -d --restart unless-stopped --name vegz-contact -p 3003:3003 vegz-contact
docker run -d --restart unless-stopped --name vegz-profile -p 3004:3004 vegz-profile
~~~
Health check example: curl http://localhost:3002/health (replace the port for each app).

## EC2 + Application Load Balancer
Run all five containers on one EC2 instance. Create five target groups, target type Instances, HTTP protocol, and matching app port. Use /health as the health check path.

| Target group | Port | ALB host-header rule |
|---|---:|---|
| vegz-login-tg | 3000 | login.vegz.online |
| vegz-signup-tg | 3001 | signup.vegz.online |
| vegz-dashboard-tg | 3002 | dashboard.vegz.online |
| vegz-contact-tg | 3003 | contact.vegz.online |
| vegz-profile-tg | 3004 | profile.vegz.online |

1. Register the same EC2 instance in all five target groups.
2. Attach an internet-facing ALB. Listener 80 can redirect to 443; listener 443 should use an ACM certificate covering all five hostnames.
3. Add HTTPS listener host-header rules mapping each hostname to its matching target group. Set a fixed-response 404 default action.
4. Create DNS records for all five hostnames pointing to the ALB (Route 53 ALIAS or your DNS provider's supported CNAME setup).
5. On the EC2 security group, allow TCP 3000–3004 only from the ALB security group. Allow public 80/443 at the ALB; do not expose app ports publicly.

This repository update does not create AWS infrastructure or DNS records; configure those separately. For production, add a secure backend or identity provider before collecting credentials or personal data.
