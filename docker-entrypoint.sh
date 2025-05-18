#!/bin/sh

if [ "${RUN_MIGRATIONS_ON_STARTUP}" = "true" ]; then
  echo "Running Prisma migrations and generating client..."
  bun x prisma migrate deploy  
  bun x prisma generate
else
  echo "Skipping automatic migrations and client generation."
fi

echo "Starting TaruBot..."
exec bun start
