FROM oven/bun:1-alpine

# Create a non-root user and group
RUN addgroup -S tarubot && adduser -S -G tarubot tarubot

# Set the working directory. This directory will be created if it doesn't exist, owned by root.
WORKDIR /home/tarubot

# Copy dependency definition files and change ownership to the tarubot user
COPY --chown=tarubot:tarubot package.json bun.lock ./

# Copy the entrypoint script into WORKDIR, change its ownership, and make it executable (still as root here)
# The script will be at /home/tarubot/docker-entrypoint.sh
COPY --chown=tarubot:tarubot docker-entrypoint.sh .
RUN chmod +x /home/tarubot/docker-entrypoint.sh

# Switch to the non-root user
USER tarubot

# Install production dependencies as the tarubot user
# This ensures node_modules are owned by tarubot and are installed in WORKDIR
RUN bun install --frozen-lockfile --production

# Copy the rest of the application source code.
# These files will be owned by tarubot because USER tarubot is active.
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

# The CMD is effectively overridden by the entrypoint in docker-compose.yml,
# but it's good practice to have a default command.
# The entrypoint script (`docker-entrypoint.sh`) will execute `bun start`.
CMD ["bun", "start"]