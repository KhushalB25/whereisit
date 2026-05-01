import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { NextRequest } from "next/server";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const hasExplicitCredentials = Boolean(clientEmail && privateKey && projectId);
const hasApplicationDefaultCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  if (clientEmail && privateKey && projectId) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      storageBucket
    });
  }

  return initializeApp({
    projectId,
    storageBucket
  });
}

export const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
export { Timestamp as AdminTimestamp };

export async function requireUser(request: NextRequest) {
  if (!hasExplicitCredentials && !hasApplicationDefaultCredentials) {
    throw new ApiError("Node backend is missing Firebase Admin credentials. Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to .env.local, then restart the dev server.", 500);
  }

  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError("Missing authorization token.", 401);

  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    throw new ApiError("Invalid or expired authorization token.", 401);
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export function apiError(error: unknown) {
  const status = error instanceof ApiError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  if (process.env.NODE_ENV !== "production") {
    console.error("[api-error]", message);
  }
  return Response.json({ error: message }, { status });
}
