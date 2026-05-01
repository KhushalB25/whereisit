# WhereIsIt

WhereIsIt is a dark, mobile-first personal home inventory tracker for logging exact item locations, expiry dates, consumption rates, photos, and recent activity.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS, dark theme by default
- Firebase Authentication, Firestore, and Storage
- Vercel-ready configuration

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in your Firebase web app values.

   On Windows PowerShell:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

   After editing `.env.local`, restart `npm run dev`. Next.js only reads new environment variables when the dev server starts.

3. In Firebase Console, enable:

   - Authentication: Email/password provider
   - Firestore Database
   - Storage

4. Deploy `firestore.rules` and `storage.rules` from this repo, or paste them into the Firebase Console rules editors.

5. Run locally:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

## Environment Variables

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Node.js backend / Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=
```

## Node.js Backend

WhereIsIt uses Next.js API route handlers as the Node.js backend. The browser only uses Firebase Auth to sign users in and obtain an ID token. Inventory reads/writes, photo uploads, consumption logs, and profile creation go through `/api/*` routes, where Firebase Admin verifies the ID token and writes to Firestore/Storage.

To get the Firebase Admin values:

1. Open Firebase Console.
2. Go to Project settings.
3. Open Service accounts.
4. Click Generate new private key.
5. Copy `project_id`, `client_email`, and `private_key` into `.env.local`.

Keep the private key quoted and preserve newlines as `\n`.

## Deployment

Vercel is the simplest deployment target:

1. Import the repository into Vercel.
2. Add the same `NEXT_PUBLIC_FIREBASE_*` environment variables.
3. Deploy.

Firebase Hosting also works by building the app with `npm run build` and hosting the generated Next output with your preferred Firebase/Next adapter.

## Data Model

- `users/{userId}` stores profile metadata.
- `items/{itemId}` stores item fields, ownership, timestamps, status, photo URL, and recent activity metadata.
- `items/{itemId}/consumptionLogs/{logId}` stores manual consumption events.
- Private items store `isPrivate: true`, `encryptionSalt`, and `encryptedData`. For those records, `name`, `location`, and `notes` are stored as `null`; the browser encrypts/decrypts them with AES-GCM using a key derived from the user's PIN.
- User documents may store `pinHash`, a bcrypt hash used by the Node.js backend to verify vault access. The PIN itself is never stored.

Photo uploads are resized client-side to a maximum width of 800px and stored at `users/{userId}/items/{itemId}/photo`.
