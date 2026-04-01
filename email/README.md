# Transactional Emails

This package contains email templates for CryptX events using [React Email](https://react.email).

## Setup

### 1. Install Dependencies

From the root of the monorepo:

```bash
bun install
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then add your [Resend API key](https://resend.com/api-keys):

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Add Images

Place the following images in the `emails/static/` folder:

| Image | Dimensions | Description |
|-------|------------|-------------|
| `header.png` | **600px x 200px** | CryptX 2.0 event banner |
| `logo.png` | **120px** width | ICTS/CryptX logo for footer |

These images are embedded directly into the email as inline attachments (using CID), so they work even with private repositories.

See `emails/static/README.md` for detailed specifications.

## Development

### Preview Emails Locally

Start the React Email development server:

```bash
# From this directory
bun run dev

# Or from the monorepo root
bun run dev --filter @repo/transactional
```

Then open [http://localhost:3000](http://localhost:3000) to preview your email templates.

The dev server provides:
- Live preview of all email templates
- Hot reload on file changes
- Desktop/mobile viewport toggle
- HTML and plain text views
- Send test emails directly from the UI

### Email Templates

Templates are organized by event:

```
emails/
├── static/           # Static assets (images)
│   ├── header.png    # 600px x 200px banner
│   └── logo.png      # 120px width logo
└── events/
    └── cryptx/
        └── welcome.tsx    # CryptX 2.0 OC selection email
```

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Accent | `#F54E00` | Titles, highlights, links |
| Background | `#13120A` | Email background, info boxes |
| Foreground | `#201E18` | Content container background |
| Border | `#292821` | Borders and dividers |
| White | `#FFFFFF` | Body text |

## Usage

### Render Email to HTML

```typescript
import { renderCryptXWelcomeEmail } from '@repo/transactional';

const html = await renderCryptXWelcomeEmail({
  name: 'John Doe',
  role: 'Technical Lead',
  meetingLink: 'https://meet.google.com/xxx-xxxx-xxx',
  senderName: 'Jane Smith',
  senderPosition: 'President',
  imageBaseUrl: 'cid:', // Use CID for embedded images
});

console.log(html);
```

### How Image Embedding Works

When sending emails, images are embedded as inline attachments using Content-ID (CID):

1. Images in `emails/static/` are read and attached to each email
2. The HTML references images using `cid:header` and `cid:logo`
3. Email clients display the images inline without external requests
4. Works with private repos since images are bundled with the email

### Send Emails with the Built-in Script

The easiest way to send emails is using the built-in script:

1. Edit `send-emails.ts` and configure your settings
2. Run `RESEND_API_KEY=re_xxx bun run send`

The script automatically:
- Loads images from `emails/static/`
- Embeds them as inline attachments
- Sends to all recipients in the list

### Send a Single Email (Programmatic)

```typescript
import { Resend } from 'resend';
import { CryptXWelcomeEmail } from '@repo/transactional';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'ICTS <noreply@icts.sjp.ac.lk>',
  to: 'user@example.com',
  subject: "Congratulations! You've been selected for CryptX 2.0",
  react: CryptXWelcomeEmail({ 
    name: 'John Doe', 
    role: 'Technical Lead',
    meetingLink: 'https://meet.google.com/xxx-xxxx-xxx',
    senderName: 'Jane Smith',
    senderPosition: 'President',
    imageBaseUrl: 'cid:', // Use CID for embedded images
  }),
  attachments: [
    { filename: 'header.png', content: headerBuffer, content_id: 'header', disposition: 'inline' },
    { filename: 'logo.png', content: logoBuffer, content_id: 'logo', disposition: 'inline' },
  ],
});
```

## Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `name` | Recipient's name | "John Doe" |
| `role` | Selected position/role | "Technical Lead" |
| `meetingLink` | Google Meet link | "https://meet.google.com/xxx" |
| `senderName` | Email sender's name | "Jane Smith" |
| `senderPosition` | Sender's position | "President" |
| `imageBaseUrl` | Base URL for images (optional) | "cid:" for embedded images |

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start email preview server at localhost:3000 |
| `bun run build` | Build TypeScript files |
| `bun run export` | Export emails to HTML files |
| `bun run send` | Send emails to all recipients |

## Sending Emails

### Quick Start

1. Edit `send-emails.ts` and update the configuration:

```typescript
const CONFIG: EmailConfig = {
  from: 'ICTS <noreply@icts.sjp.ac.lk>',
  subject: "Congratulations! You've been selected for CryptX 2.0",
  senderName: 'Your Name Here',
  senderPosition: 'President',
  meetingLink: 'https://meet.google.com/xxx-xxxx-xxx',
};
```

2. Add your recipients:

```typescript
const RECIPIENTS: Recipient[] = [
  { email: 'john@example.com', name: 'John Doe', role: 'Technical Lead' },
  { email: 'jane@example.com', name: 'Jane Smith', role: 'Design Lead' },
  // Add more...
];
```

3. Send the emails:

```bash
RESEND_API_KEY=re_xxx bun run send
```

### Using Environment File

Create a `.env` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then run:

```bash
source .env && bun run send
```

## Adding New Templates

1. Create a new `.tsx` file in the appropriate folder under `emails/`
2. Export a React component as the default export
3. The template will automatically appear in the preview server

Example template structure:

```tsx
import { Html, Head, Body, Container, Text } from '@react-email/components';
import * as React from 'react';

interface MyEmailProps {
  name: string;
}

export const MyEmail = ({ name = 'Guest' }: MyEmailProps) => {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>Hello, {name}!</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default MyEmail;
```

## Resources

- [React Email Documentation](https://react.email/docs)
- [React Email Components](https://react.email/components)
- [Resend Documentation](https://resend.com/docs)
