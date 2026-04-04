# Deploy CryptX MVP in 5 Minutes

## Prerequisites Check
- [ ] Firebase project created
- [ ] Vercel account ready
- [ ] Resend account with verified domain

## Step 1: Install & Seed (2 minutes)
\`\`\`bash
bun install
bun run mvp-seed
\`\`\`

## Step 2: Deploy Firebase Rules (1 minute)
\`\`\`bash
bun add -D firebase-tools
bunx firebase deploy --only firestore:rules,database
\`\`\`

## Step 3: Start Local Test (1 minute)
\`\`\`bash
bun dev
\`\`\`

Then visit:
- Admin: http://localhost:3000/admin
  - Login: admin@cryptx.lk / Admin123!
- Judge: http://localhost:3000/judge/dashboard
  - Login: judge1@cryptx.lk / Judge123!

## Step 4: Production Deploy (1 minute)
\`\`\`bash
# In Vercel dashboard, set all env vars from .env
# Then:
vercel --prod
\`\`\`

## Done! 🎉

Test the complete flow:
1. Admin imports teams
2. Admin invites judges (emails sent automatically)
3. Judges score teams
4. Leaderboard updates in real-time
5. Admin exports results

---

**Full guide:** MVP_QUICKSTART.md  
**Complete docs:** MVP_COMPLETE.md
