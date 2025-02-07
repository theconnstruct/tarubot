# TaruBot

This Discord bot synchronizes your Final Fantasy XIV Free Company (FC) membership with roles on your Discord server.

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/theconnstruct/tarubot/tree/main&refcode=bb136a9104e1)

**Please note that this button contains my DigitalOcean referral link.** If you sign up for a new DigitalOcean account through this link, both you and I may receive service credits, subject to the current terms of DigitalOcean's Referral Program. Importantly, I do not receive any of your personal information; any data you provide is handled according to DigitalOcean's Privacy Policy and Terms of Service. You are free to sign up directly with DigitalOcean without using this referral link if you prefer. Any referral credits I receive help offset the costs of hosting and development.

## Version 2

Rewrite time! Version 1... worked... for a very generous definition of the term. There are a lot of things about its design I wish I did differently.

So now I'm going to do them differently, and probably just as badly.

## Core Functionality

* Automatically assigns and updates Discord roles based on FC membership (e.g., "Member," "Guest").

## Required Components

* **[Disnake](https://disnake.dev/)**: Discord API wrapper for Python.
* **[PostgreSQL](https://www.postgresql.org/)**: Database to store member information.
* **[Nodestone](https://github.com/xivapi/nodestone/)**: A self-hosted service for retrieving character and Free Company data from FFXIV's Lodestone. Requires either NodeJS or Docker.

### Wait, what?

> _Why use a separate component like Nodestone to parse Lodestone data?_

Could I rewrite TaruBot to use something like BeautifulSoup and CSS selectors to parse Lodestone data directly? Sure. Do I _want_ to? **I would rather shave my entire body using a chainsaw.**

> I don't want to run a Docker container or a NodeJS process. Pleeeeease?

Oh, for f... If it's that important to you, fork the repo, write the code, _test it extensively_, and submit a PR. Otherwise, **not happening.**

## Planned/Future Functionality

* Configurable role names.
* Support for multiple Free Companies.
* Automatic role updates on character name/server changes.
* Character profile display commands.
* FC activity tracking (if feasible via Lodestone).
* Customizable welcome messages.