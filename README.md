# StashIt - Your Personal Information Manager

StashIt is a modern web application built with Next.js that helps you save, organize, and manage your personal information, recipes, and other content from around the web. With its clean and intuitive interface, you can easily store and retrieve your favorite content in one centralized location.

## Features

- Save and organize content from web URLs
- Powerful search functionality
- Categorize entries with tags and categories
- Responsive design for desktop and mobile
- Image preview support
- Fast and efficient performance
- Clean and intuitive user interface

## Tech Stack

- [Next.js 16.4](https://nextjs.org/) - React framework
- [React 19](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Cheerio](https://cheerio.js.org/) - Web scraping

## Getting Started

### Prerequisites

- Node.js 24.22.1 (see `.nvmrc`; run `nvm install` and `nvm use`)
- npm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gorecodecom/stashit.git
cd stashit
```

2. Install dependencies:
```bash
npm ci
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
stashit/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── components/   # React components
│   │   └── pages/        # Application pages
│   └── types/            # TypeScript type definitions
├── data/                 # Local data storage
├── public/               # Static files
└── ...config files
```

## Features in Detail

### URL Content Scraping
- Automatically extracts title, content, and images from web pages
- Supports various content types and layouts

### Content Organization
- Flexible categorization system
- Tag-based organization
- Full-text search capabilities

### Modern UI/UX
- Responsive design for all devices
- Dark mode support
- Clean and intuitive interface
- Real-time updates

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)

## Validation and deployment

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Start the production server with `npm start`. Back up `data/` before a deployment; it contains personal entries and categories. The API has no built-in authentication and the scraper accepts arbitrary URLs. Keep the application behind access control on a trusted network; dependency updates alone do not make it suitable for public access.
