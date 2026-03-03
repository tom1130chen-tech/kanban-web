import { signInAnonymously } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

let inflight: Promise<void> | null = null;

export async function ensureAnonAuth(): Promise<void> {
  if (inflight) return inflight;

  inflight = (async () => {
    const auth = getFirebaseAuth();
    if (auth.currentUser) return;
    await signInAnonymously(auth);
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}
