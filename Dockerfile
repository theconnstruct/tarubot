FROM oven/bun:1-alpine
RUN addgroup -S tarubot && adduser -S -G tarubot tarubot
USER tarubot
WORKDIR /home/tarubot
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
CMD ["bun", "start"]