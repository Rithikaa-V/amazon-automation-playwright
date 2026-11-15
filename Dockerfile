# Image tag MUST equal the @playwright/test version in package.json
FROM mcr.microsoft.com/playwright:v1.65.1-noble

WORKDIR /app
ENV CI=1 HOME=/root

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run typecheck

CMD ["npx", "playwright", "test", "--project=unit", "--project=public"]
