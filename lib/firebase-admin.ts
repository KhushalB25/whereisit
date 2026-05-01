import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { NextRequest } from "next/server";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
const privateKey = rawPrivateKey?.replace(/\\n/g, "\n");
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const hasExplicitCredentials = Boolean(clientEmail && privateKey && projectId);
const hasApplicationDefaultCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

let _adminApp: ReturnType<typeof initializeApp> | null = null;
let _adminInitError: Error | null = null;

function ensureAdminApp() {
  if (_adminApp) return _adminApp;
  if (_adminInitError) throw _adminInitError;

  try {
    if (getApps().length) {
      _adminApp = getApps()[0];
    } else if (clientEmail && privateKey && projectId) {
      _adminApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        storageBucket
      });
    } else {
      _adminApp = initializeApp({
        projectId,
        storageBucket
      });
    }
    return _adminApp;
  } catch (error) {
    _adminInitError = error instanceof Error ? error : new Error(String(error));
    throw _adminInitError;
  }
}

function getAdminAuth() {
  return getAuth(ensureAdminApp());
}

function getAdminDb() {
  return getFirestore(ensureAdminApp());
}

function getAdminStorage() {
  return getStorage(ensureAdminApp());
}

export { Timestamp as AdminTimestamp };

export async function requireUser(request: NextRequest) {
  if (!hasExplicitCredentials && !hasApplicationDefaultCredentials) {
    throw new ApiError(
      "Node backend is missing Firebase Admin credentials. Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to .env.local, then restart the dev server.",
      500
    );
  }

  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError("Missing authorization token.", 401);

  try {
    const auth = getAdminAuth();
    return await auth.verifyIdToken(token);
  } catch (error) {
    // If Firebase Admin failed to initialize (e.g. bad private key), surface that
    if (_adminInitError) {
      console.error("[firebase-admin] Init error:", _adminInitError.message);
      throw new ApiError(
        `Firebase Admin initialization failed: ${_adminInitError.message}`,
        500
      );
    }
    console.error("[requireUser]", error instanceof Error ? error.message : error);
    throw new ApiError("Invalid or expired authorization token.", 401);
  }
}

/** Lazy accessors — init error surfaces on first use, not at module load. */
export function adminApp() {
  return ensureAdminApp();
}
export function adminAuth() {
  return getAdminAuth();
}
export function adminDb() {
  return getAdminDb();
}
export function adminStorage() {
  return getAdminStorage();
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
  console.error("[api-error]", message);
  return Response.json({ error: message }, { status });
}
