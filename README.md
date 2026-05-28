# FAS26 SaaS - AI-Powered Content Generation & Productivity Dashboard

A Next.js application combining AI content generation with productivity tools. Built with modern web technologies and ready for deployment.

## Features Implemented

### AI Content Generation (`/content`)
- Multi-modal prompt engine (Text, Image, Video, Audio tabs)
- Template library for blog posts, social captions, product descriptions, newsletters, video scripts
- API endpoint at `/api/generate` for content generation

### Brand Voice Customization (`/brand-voice`)
- Create and edit brand voices
- Preset voices: Professional, Friendly, Persuasive
- Inline editing with save/delete functionality

### SEO Tools (`/seo`)
- Content analyzer with readability scoring
- Keyword suggestions with search volume and difficulty
- Meta tags generator (title, description, alt text)
- API endpoint at `/api/keywords`

### Productivity Dashboard (`/dashboard`)
- Task statistics (To Do, In Progress, Done)
- Pomodoro timer widget
- Responsive layout

### Workspace (`/workspace`)
- List and Kanban views
- Task management with priorities
- Drag-and-drop ready structure

### Analytics (`/analytics`)
- Usage metrics dashboard
- A/B testing suggestions
- Token consumption tracking

### Pricing (`/pricing`)
- Tiered plans: Free Trial, Starter ($29), Pro ($99), Enterprise
- Feature comparison cards

### Authentication (`/auth`)
- Sign-in page with credentials
- API endpoint at `/api/auth/[...nextauth]`

## Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── generate/route.ts
│   │   └── keywords/route.ts
│   ├── components/
│   │   └── sidebar.tsx
│   ├── analytics/page.tsx
│   ├── auth/page.tsx
│   ├── brand-voice/page.tsx
│   ├── content/page.tsx
│   ├── dashboard/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── pricing/page.tsx
│   ├── seo/page.tsx
│   └── workspace/page.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
├── lib/
│   └── utils.ts
└── __tests__/
    └── content.test.tsx
```

## Tech Stack
- **Framework**: Next.js 16.2.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, lucide-react
- **State**: React hooks
- **Testing**: Jest, Testing Library

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Deployment
Deploy to Vercel or any Node.js hosting platform. Set environment variables:
- `NEXTAUTH_SECRET` - Secret for session encryption
- `NEXTAUTH_URL` - Your production URL

Run `npm run dev` to start development server at `http://localhost:3000`.