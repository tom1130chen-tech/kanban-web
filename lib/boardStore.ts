import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getDb } from "./firebase";
import type { BoardState } from "./boardTypes";

const COLLECTION = "boards";
const BOARD_ID = "main"; // 先固定一个 doc，后面要多 board 再扩展

export function boardDocRef() {
  return doc(getDb(), COLLECTION, BOARD_ID);
}

export function subscribeBoard(cb: (board: BoardState) => void, onErr: (e: unknown) => void) {
  return onSnapshot(
    boardDocRef(),
    (snap) => {
      const data = snap.data() as { state?: BoardState } | undefined;
      if (data?.state) cb(data.state);
    },
    (err) => onErr(err)
  );
}

export async function writeBoard(state: BoardState) {
  // serverTimestamp 让你能看最近写入时间
  await setDoc(
    boardDocRef(),
    { state, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
