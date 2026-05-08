# Clip-cast

Clip-cast is a modern video recording and sharing platform that enables users to record their screen, manage video content, and share it with others.

## Features

- **Screen Recording**: Capture your screen directly from the browser.
- **Video Management**: Manage and organize your recorded content.
- **Easy Sharing**: Share your videos with others via direct links.
- **Modern Tech Stack**: Built with Next.js 16, React 19, and Tailwind CSS 4.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI**: [React 19](https://react.dev/) & [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better-Auth](https://www.better-auth.com/) (Google & GitHub)
- **Video Infrastructure**: [Bunny.net](https://bunny.net/) (Streaming, Storage, Thumbnails)
- **Security**: [Arcjet](https://arcjet.com/) (Rate limiting & Bot protection)
- **Typography**: Custom Satoshi font family

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- PostgreSQL database
- Bunny.net account
- Arcjet account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/clip-cast.git
   cd clip-cast
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env.local` file in the root directory and add the necessary environment variables (refer to `.env.example` if available).

4. Push the database schema:
   ```bash
   npx drizzle-kit push
   ```

### Running the Project

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint
```

## Architecture

- `app/`: Next.js App Router structure (auth, root, api).
- `actions/`: Server Actions for data mutations and Bunny.net integration.
- `components/`: Modular React components (home, video, recording, layout, ui).
- `db/`: Database configuration and schema definitions.
- `hooks/`: Custom React hooks for specialized logic (e.g., screen recording).
- `lib/`: Shared utility functions and third-party client initializations.

## Development Conventions

- **Server Actions**: Used for all data fetching and mutations, wrapped with error handling.
- **Styling**: Mixing Tailwind utility classes with semantic custom classes.
- **Security**: Rate limiting implemented via Arcjet in sensitive actions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
