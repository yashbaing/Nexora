FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY dist ./dist
COPY deployed-addresses.json ./deployed-addresses.json
ENV PORT=5001
EXPOSE 5001
CMD ["node", "dist/index.js"]
