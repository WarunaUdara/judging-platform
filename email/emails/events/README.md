# Email Templates Structure

This directory contains email templates organized by event.

## Folder Structure

```
emails/events/
  {event-name}/
    {template-name}.tsx          # Email template component

static/events/
  {event-name}/
    configs/
      {template-name}-config.json # Configuration file for the template
    assets/                      # Static assets (images, etc.) for this event
```

**Note:** Configs and assets are in the `static/` directory (outside `emails/`) to prevent them from showing up in the react-email dashboard.

## Creating a New Email Template

To create a new email template for an event:

1. **Create the template file**: `emails/events/{event-name}/{template-name}.tsx`
   - Export a default React component
   - Use `@react-email/components` for email components

2. **Create the config file**: `static/events/{event-name}/configs/{template-name}-config.json`
   - Must include:
     - `email.from` - Sender email address
     - `email.subject` - Email subject line
     - `images.header` - Header image URL
     - `images.logo` - Logo image URL
     - `sender.name` - Sender name
     - `sender.position` - Sender position
     - `recipients` - Array of recipient objects with `email`, `name`, and `role`
   - Additional fields depend on the template requirements

3. **Add static assets** (if needed): Place them in `static/events/{event-name}/assets/`

4. **Add send command** to `package.json`:
   ```json
   "send:{event-name}-{template-name}": "EMAIL_EVENT={event-name} EMAIL_TEMPLATE={template-name} bun run send.ts"
   ```

5. **Export from `index.ts`** (optional, for programmatic use):
   ```typescript
   export { YourTemplateEmail } from './emails/events/{event-name}/{template-name}';
   ```

## Example

For a `cryptx` event with a `welcome` template:

- Template: `emails/events/cryptx/welcome.tsx`
- Config: `static/events/cryptx/configs/welcome-config.json`
- Assets: `static/events/cryptx/assets/`
- Command: `bun run send:cryptx-welcome`

## Sending Emails

Use the npm/bun script:
```bash
RESEND_API_KEY=re_xxx bun run send:{event-name}-{template-name}
```

Or directly:
```bash
RESEND_API_KEY=re_xxx EMAIL_EVENT={event-name} EMAIL_TEMPLATE={template-name} bun run send.ts
```

