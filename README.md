# Vegz Login & Signup Frontends

Two independent Node.js/Express frontend applications in one repository.

| App | Directory | Port | Hostname |
|---|---|---:|---|
| Login | login-page/ | 3000 | login.vegz.online |
| Signup | signup-page/ | 3001 | signup.vegz.online |

These are frontend demos only. Forms validate input in the browser and show a demo message; they do not create accounts, authenticate users, or store passwords.

## Run locally

~~~sh
cd login-page && npm install && npm start
# In another terminal:
cd signup-page && npm install && npm start
~~~

Open http://localhost:3000 and http://localhost:3001.

## Build and run with Docker

~~~sh
docker build -t vegz-login ./login-page
docker build -t vegz-signup ./signup-page
docker run -d --name vegz-login -p 3000:3000 vegz-login
docker run -d --name vegz-signup -p 3001:3001 vegz-signup
~~~

## EC2 + Application Load Balancer

1. Run login on EC2 TCP 3000 and signup on TCP 3001.
2. Create two target groups, target type Instances:
   - vegz-login-tg: HTTP port 3000, health check path /.
   - vegz-signup-tg: HTTP port 3001, health check path /.
3. Register the EC2 instance in both target groups.
4. Attach an internet-facing ALB. Listener 80 can redirect to 443. Listener 443 uses an ACM certificate covering both hostnames.
5. Add HTTPS listener host-header rules:
   - login.vegz.online → vegz-login-tg.
   - signup.vegz.online → vegz-signup-tg.
   - Default action: fixed response 404.
6. Create DNS records login.vegz.online and signup.vegz.online pointing to the ALB (Route 53 ALIAS or your DNS provider's supported CNAME setup).
7. EC2 security group: allow inbound 3000 and 3001 only from the ALB security group. Allow public 80/443 at the ALB. Do not expose app ports publicly.

For production, add a real authentication backend or identity provider before collecting credentials.
