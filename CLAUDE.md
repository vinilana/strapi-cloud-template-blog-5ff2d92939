# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Strapi v5 blog template application with pre-configured content types for a blog system.

## Common Development Commands

- `npm run develop` - Start Strapi in development mode with auto-reload
- `npm run start` - Start Strapi in production mode (no auto-reload)
- `npm run build` - Build the admin panel
- `npm run seed:example` - Seed the database with example data using `scripts/seed.js`
- `npm run deploy` - Deploy to Strapi Cloud

## Architecture

### Content Types
The application has 5 main API content types located in `src/api/`:
- **article** - Blog posts with title, description, slug, cover image, author relation, category relation, and dynamic content blocks
- **author** - Article authors with avatar support
- **category** - Article categories
- **about** - About page content with dynamic blocks
- **global** - Global site settings including SEO defaults and favicon

### Dynamic Components
Shared components in `src/components/shared/`:
- **media** - Media upload component
- **quote** - Quote blocks
- **rich-text** - Rich text editor blocks
- **slider** - Image slider component
- **seo** - SEO metadata component

### Database Configuration
- Supports SQLite (default), MySQL, and PostgreSQL
- Configuration in `config/database.js`
- Default SQLite database stored in `.tmp/data.db`
- Connection settings controlled via environment variables

### Environment Setup
Create a `.env` file from `.env.example` with:
- `HOST` and `PORT` for server configuration
- `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` for security
- Database configuration variables (DATABASE_CLIENT, DATABASE_HOST, etc.)

### Data Seeding
The `scripts/seed.js` script:
- Imports initial blog data from `data/data.json`
- Uploads images from `data/uploads/`
- Sets up public permissions for content types
- Creates categories, authors, articles, global settings, and about page
- Only runs on first initialization (tracked via plugin store)