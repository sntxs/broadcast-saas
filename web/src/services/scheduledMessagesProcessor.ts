import {
    Timestamp,
    collection,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

import { db } from "../firebase/config";

export async function processScheduledMessagesFromClient(clientId: string) {
    const messagesQuery = query(
        collection(db, "messages"),
        where("clientId", "==", clientId),
        where("status", "==", "scheduled")
    );

    const snapshot = await getDocs(messagesQuery);
    const now = Timestamp.now();

    const updates = snapshot.docs
        .filter((document) => {
            const data = document.data();
            const scheduledAt = data.scheduledAt as Timestamp | null;

            if (!scheduledAt) {
                return false;
            }

            return scheduledAt.toMillis() <= now.toMillis();
        })
        .map((document) =>
            updateDoc(document.ref, {
                status: "sent",
                sentAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            })
        );

    await Promise.all(updates);
}