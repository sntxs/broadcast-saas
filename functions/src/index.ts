import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import {
    Timestamp,
    getFirestore,
} from "firebase-admin/firestore";

initializeApp();

const db = getFirestore();

export const processScheduledMessages = onSchedule(
    {
        schedule: "every 1 minutes",
        timeZone: "America/Campo_Grande",
    },
    async () => {
        const now = Timestamp.now();

        const snapshot = await db
            .collection("messages")
            .where("status", "==", "scheduled")
            .where("scheduledAt", "<=", now)
            .limit(500)
            .get();

        if (snapshot.empty) {
            return;
        }

        const batch = db.batch();

        snapshot.docs.forEach((messageDocument) => {
            batch.update(messageDocument.ref, {
                status: "sent",
                sentAt: now,
                updatedAt: now,
            });
        });

        await batch.commit();
    }
);