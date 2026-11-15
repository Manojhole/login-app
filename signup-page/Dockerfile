FROM node:22-alpine
ENV NODE_ENV=production PORT=3001
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js ./
COPY public ./public
USER node
EXPOSE 3001
CMD ["npm", "start"]
