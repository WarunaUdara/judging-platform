# Email Static Assets

Place image files in this directory for use in email templates.

## Required Images

### `header.png`
- **Dimensions:** 600px x 200px (width x height)
- **Aspect Ratio:** 3:1
- **Description:** CryptX 2.0 event banner/header image
- **Used in:** Top of all CryptX emails
- **Background:** Should blend with dark theme (#13120A or #201E18)

### `logo.png`
- **Dimensions:** 120px x 120px (or maintain aspect ratio with 120px width)
- **Description:** ICTS/CryptX logo for footer
- **Used in:** Footer section of all emails

## Image Specifications

| Image | Width | Height | Format | Notes |
|-------|-------|--------|--------|-------|
| `header.png` | **600px** | **200px** | PNG | Event banner, full width |
| `logo.png` | **120px** | auto | PNG | Footer logo, centered |

## Guidelines

1. Use PNG format for best quality and transparency support
2. Optimize images for web (compress without losing quality)
3. Ensure images have appropriate contrast with dark background (#13120A)
4. Test images in email clients before sending
5. Keep file sizes under 100KB for faster loading

## Local Development

During development with `bun run dev`, images in this `static/` folder are served automatically by react-email at `/static/filename.png`.

## Production

For production emails, images should be hosted on a CDN or accessible URL. Update the image URLs in the template before sending.

Current GitHub raw URLs:
```
https://raw.githubusercontent.com/University-Of-Sri-Jayewardenepura/ICTS/main/packages/transactional/emails/static/header.png
https://raw.githubusercontent.com/University-Of-Sri-Jayewardenepura/ICTS/main/packages/transactional/emails/static/logo.png
```
