FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run lint && npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
RUN addgroup -S app && adduser -S app -G app && mkdir -p /app/.data && chown -R app:app /app
USER app
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-p", "3000"]
