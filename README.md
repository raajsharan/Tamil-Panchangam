# Tamil Calendar & Panchangam Web Application

Production-ready Tamil calendar application with automatic data scraping, admin panel, and Telegram bot.

## Features

- 🌅 Daily Tamil Calendar & Panchangam
- 🌐 Tamil + English language support
- 📱 Mobile responsive UI
- 🔄 Automatic data scraping from multiple sources
- 📊 Admin panel with full CRUD operations
- 🤖 Telegram bot for daily updates
- 🔒 JWT authentication
- 🛡️ Self-healing data system

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Puppeteer for scraping
- node-cron for scheduling

### Frontend
- Next.js 14
- Tailwind CSS
- Zustand for state management
- Axios for API calls

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7.0+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/tamil-calendar.git
cd tamil-calendar

# Install dependencies
pnpm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
# Edit .env with your settings

# Start development servers
pnpm dev
```

### Environment Variables

Create `apps/api/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/tamil_calendar
PORT=5000
JWT_SECRET=your-secret-key-min-32-chars
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

## Project Structure

```
tamil-calendar/
├── apps/
│   ├── api/              # Backend API
│   │   └── src/
│   │       ├── controllers/
│   │       ├── models/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── scrapers/
│   │       ├── middleware/
│   │       ├── cron/
│   │       └── utils/
│   └── web/              # Frontend (Next.js)
│       └── src/
│           ├── app/
│           │   ├── admin/
│           │   └── calendar/
│           └── components/
├── configs/              # Nginx and other configs
├── docs/                # Documentation
└── scripts/             # Deployment scripts
```

## API Endpoints

### Public
- `GET /api/calendar/today` - Today's panchangam
- `GET /api/calendar/date/:date` - Specific date data
- `GET /api/calendar/month/:year/:month` - Monthly data
- `GET /api/special-days` - List special days
- `GET /api/special-days/upcoming` - Upcoming special days

### Admin (requires JWT)
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/calendar` - List all calendar entries
- `PUT /api/admin/calendar/:date` - Update calendar entry
- `POST /api/admin/scraper/run` - Trigger scraper
- `GET /api/admin/logs` - View system logs

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for full deployment instructions.

## Telegram Bot Commands

- `/today` - Get today's panchangam
- `/tomorrow` - Get tomorrow's panchangam
- `/amavasya` - Next Amavasya date
- `/pournami` - Next Pournami date
- `/subscribe` - Subscribe to daily updates
- `/unsubscribe` - Unsubscribe

## Data Sources

1. Drik Panchang (primary)
2. Prokerala
3. Golden Chennai
4. Dinamalar

## License

MIT
