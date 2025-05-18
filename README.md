# tarubot

A Discord bot built with Bun, TypeScript, and discord.js, designed to keep Discord in sync with Final Fantasy XIV Lodestone data. It uses a PostgreSQL database to cache Lodestone data, as direct Lodestone access can be slow, ensuring faster responses for frequent queries.

## ✨ Features

*   **Lodestone Integration (via Nodestone service):**
    *   Fetch character information by ID.
    *   Search for characters by name and world.
    *   Fetch Free Company information by ID.
    *   Retrieve lists of Free Company members.
*   **Database Integration (PostgreSQL via Prisma):**
    *   Caches data retrieved from Lodestone to provide faster responses and reduce direct Lodestone API calls.
    *   Stores and manages this cached data (e.g., character details, Free Company memberships).
    *   Enables features like role assignments based on the cached Free Company membership data.

## 🛠️ Tech Stack

*   **Runtime:** [Bun](https://bun.sh/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Framework:** [discord.js](https://discord.js.org/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM:** [Prisma](https://www.prisma.io/) (interfacing with PostgreSQL)
*   **API Interaction:** [axios](https://axios-http.com/) (for communicating with Nodestone)
*   **Logging:** [tslog](https://tslog.js.org/)

## 📋 Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [Bun](https://bun.sh/docs/installation)
*   [Docker](https://www.docker.com/) (optional, TaruBot can be run directly if desired)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/theconnstruct/tarubot.git
cd tarubot
```

### 2. Install Dependencies

This project uses Bun for package management.

```bash
bun install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project. This file is used to provide sensitive credentials and other configuration options. The `docker-compose.yml` file sources variables from this `.env` file for the `db` and `worker` services.

**`.env` File Example:**

```env
# Discord Bot (Required for worker service)
DISCORD_APP_ID=[Discord bot application ID]
DISCORD_GUILD_ID=[Discord server ID, or comment out to use global commands]
DISCORD_TOKEN=[Discord bot token]

# PostgreSQL Database (Required for db service, and for worker service to construct DATABASE_URL)
POSTGRES_USER=tarubot
POSTGRES_PASSWORD=[PostgreSQL user password]
POSTGRES_DB=tarubot
# POSTGRES_HOST=db # Optional: Defaults to 'db' in docker-compose for the worker. Uncomment to override.
# POSTGRES_PORT=5432 # Optional: Defaults to '5432' in docker-compose for the worker. Uncomment to override.

# Nodestone Service URL (Used by the 'worker' service)
NODESTONE_URL=http://nodestone:8080

# Auto-run Prisma migrations on startup
# Set to true to have the worker container run `prisma migrate deploy` and `prisma generate` on startup.
# Set to false to manage migrations manually (e.g., `docker-compose exec worker bunx prisma migrate deploy`).
RUN_MIGRATIONS_ON_STARTUP=true
```

**Explanation of `.env` Variables:**

*   `DISCORD_TOKEN`: **Required.** Your Discord bot's secret token. Used by the `worker` service.
*   `DISCORD_APP_ID`: Your Discord application ID. Used by the `worker` service.
*   `DISCORD_GUILD_ID`: Your Discord guild ID. Used by the `worker` service.
*   `POSTGRES_USER`: Username for the PostgreSQL database. Used by the `db` service and by the `worker` service to construct its `DATABASE_URL`.
*   `POSTGRES_PASSWORD`: Password for the PostgreSQL database. Used by the `db` service and by the `worker` service to construct its `DATABASE_URL`.
*   `POSTGRES_DB`: Name of the PostgreSQL database. Used by the `db` service and by the `worker` service to construct its `DATABASE_URL`.
*   `POSTGRES_HOST`: (Optional) Hostname for the PostgreSQL database, defaults to `db` for the `worker` service in `docker-compose.yml`.
*   `POSTGRES_PORT`: (Optional) Port for the PostgreSQL database, defaults to `5432` for the `worker` service in `docker-compose.yml`.
*   `NODESTONE_URL`: URL for the Nodestone service. Used by the `worker` service to connect to the `nodestone` service defined in `docker-compose.yml`.

**Important for Docker Compose:**
*   The `docker-compose.yml` file defines three services: `nodestone`, `db`, and `worker`.
*   The `db` service (PostgreSQL) directly uses `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` from the `.env` file via `env_file: .env`.
*   The `worker` service (TaruBot) sources variables from the `.env` file. It then **constructs** its `DATABASE_URL` internally. The `docker-entrypoint.sh` script within the `worker` container handles running `prisma migrate deploy` and `prisma generate` on startup if `RUN_MIGRATIONS_ON_STARTUP` is set to `true` in the `.env` file.
*   You **must** provide `DISCORD_TOKEN`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in the `.env` file.
*   `DISCORD_APP_ID`, `DISCORD_GUILD_ID`, `NODESTONE_URL` have defaults in the example `.env` but should be configured.
*   `POSTGRES_HOST` and `POSTGRES_PORT` can be added to the `.env` file if you need to override the defaults used by the `worker` service (which are `db` and `5432` respectively, to connect to the `db` service).
*   `RUN_MIGRATIONS_ON_STARTUP`: Set to `true` (default in example) in the `.env` file to have the `worker` container automatically run database migrations and generate the Prisma client on startup. Set to `false` if you prefer to manage these steps manually (e.g., `docker-compose exec worker bunx prisma migrate deploy`).

**Note on Nodestone (Manual Setup):** If you are *not* running TaruBot within the provided Docker setup, ensure you have a [Nodestone](https://github.com/xivapi/nodestone) instance running and accessible. You would set `NODESTONE_URL` in your `.env` file (e.g., `NODESTONE_URL=http://localhost:8080`). You would also need to manage your PostgreSQL database manually and ensure your application (Prisma) is configured with the correct `DATABASE_URL` (e.g., by setting it directly in the `.env` file for a manual run), and run migrations manually.

### 4. Set up the Database (Primarily for Manual Setup)

**For Docker Compose users, the `db` service handles the PostgreSQL setup. The `worker` service will connect to this database. The `docker-entrypoint.sh` script in the `worker` container automatically handles `prisma migrate deploy` and `prisma generate` on startup if `RUN_MIGRATIONS_ON_STARTUP=true` in the `.env` file. If `RUN_MIGRATIONS_ON_STARTUP=false`, or for development purposes (e.g., using `migrate dev`), you can run these commands manually against the `worker` container.**

If running manually, or if you need to manage migrations for the Docker setup explicitly (e.g., `RUN_MIGRATIONS_ON_STARTUP=false`):

Run Prisma migrations to set up your database schema against your PostgreSQL instance:

```powershell
bunx prisma migrate dev
```

Generate the Prisma Client (usually done automatically after `migrate dev`, but can be run manually if needed):

```powershell
bunx prisma generate
```

## ධ Running the Bot

### 1. Using Docker Compose (Recommended for a streamlined setup)

This method will set up and run TaruBot, the Nodestone service, and a PostgreSQL database in containers.

1.  **Ensure Docker is installed and running.**
2.  **Create and configure your `.env` file** as described in the "Configure Environment Variables" section. The default values in the `.env` example are designed to work with the `docker-compose.yml` out of the box.
3.  **Build and start the services:**

    ```powershell
    docker-compose up --build -d
    ```
    *   `--build` will build the images if they don't exist or if the Dockerfile/context has changed.
    *   `-d` will run the containers in detached mode (in the background).
    *   The first time you run this, Docker will download the PostgreSQL image and build the Nodestone and TaruBot images, which might take a few minutes.
    *   On startup, if `RUN_MIGRATIONS_ON_STARTUP=true` in your `.env` file, the `worker` container will automatically attempt to run database migrations (`prisma migrate deploy`) and generate the Prisma client (`prisma generate`).

4.  **Database Migrations (if `RUN_MIGRATIONS_ON_STARTUP=false` or for `migrate dev`):**
    If `RUN_MIGRATIONS_ON_STARTUP` is `false` in your `.env`, or if you need to run development migrations:
    ```powershell
    docker-compose exec worker bunx prisma migrate deploy # Or 'migrate dev' for development
    # prisma generate is also handled by the entrypoint or can be run manually if needed:
    # docker-compose exec worker bunx prisma generate
    ```

5.  **To view logs:**

    ```powershell
    docker-compose logs -f worker  # For TaruBot logs
    docker-compose logs -f nodestone # For Nodestone logs
    ```

6.  **To stop the services:**

    ```powershell
    docker-compose down
    ```

### 2. Running Manually

This setup requires you to manage the PostgreSQL server and Nodestone service independently.

0.  **Ensure a PostgreSQL server is running and accessible.**
    *   You will need to have a PostgreSQL server installed, configured, and running.
    *   The setup and management of the PostgreSQL server itself are beyond the scope of this README.
    *   Ensure you have a database created for TaruBot and the necessary credentials (user, password, host, port, database name).
1.  **Ensure Nodestone is running and accessible.**
    *   You will need to clone and run the [Nodestone service](https://github.com/xivapi/nodestone) separately.
    *   Update the `NODESTONE_URL` in your `.env` file to point to your manually running Nodestone instance (e.g., `http://localhost:8080`).
2.  **Create and configure your `.env` file** as described in the "Configure Environment Variables" section.
    *   For **Docker Compose**, ensure all required variables are set as the `worker` service will construct `DATABASE_URL` from them.
    *   For **manual setup**, you would typically define `DATABASE_URL` directly in your `.env` file, pointing to your manually managed PostgreSQL instance.
3.  **Build and start the services:**
    *   For **Docker Compose**:
        ```powershell
        docker-compose up --build -d
        ```
    *   For **manual setup**, ensure your PostgreSQL and Nodestone services are running, then start the bot with:
        ```powershell
        bun start
        ```
4.  **Database Migrations:**
    If using Docker Compose and your bot doesn't automatically run migrations on startup, run:
    ```powershell
    docker-compose exec worker bunx prisma migrate deploy # Or 'migrate dev' for development
    ```
    If running manually, ensure your `DATABASE_URL` is correctly set in your `.env` file, then run:
    ```powershell
    bunx prisma migrate dev
    ```
5.  **Generate Prisma Client** (if needed):

    ```powershell
    bunx prisma generate
    ```
6.  **Start the bot:**

    ```powershell
    bun start
    ```
    This will execute the `start` script defined in your `package.json` (which is `bun run .`).

## 📁 Project Structure

```
.
├── prisma/                 # Prisma schema and migration files
│   └── schema.prisma
├── src/                    # Source code
│   ├── commands/           # Discord command handlers
│   │   └── ping.ts
│   ├── core/               # Core bot logic
│   │   └── tarubot.ts
│   ├── events/             # Event handlers (e.g., ready, interactionCreate)
│   │   ├── error.ts
│   │   ├── interactionCreate.ts
│   │   └── ready.ts
│   ├── lib/                # Utility libraries
│   │   └── logger.ts
│   ├── services/           # Services (e.g., database, external APIs)
│   │   ├── db.ts
│   │   └── lodestone.ts
│   ├── types/              # TypeScript type definitions
│   │   └── global.d.ts
│   └── index.ts            # Main entry point
├── .env                    # Environment variables (Git ignored)
├── .env.example            # Example environment variables
├── bun.lockb               # Bun lock file
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker configuration
├── LICENSE                 # Project License
├── package.json            # Project metadata and dependencies
├── README.md               # This file
└── tsconfig.json           # TypeScript configuration
```

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

Copyright (c) 2025 Connor Maddox