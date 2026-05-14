import {
    Timestamp,
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

import { db } from "../firebase/config";

export type MessageStatus = "sent" | "scheduled";

export type BroadcastMessage = {
    id: string;
    clientId: string;
    connectionId: string;
    text: string;
    contactIds: string[];
    status: MessageStatus;
    scheduledAt?: Timestamp | null;
    sentAt?: Timestamp | null;
    createdAt?: Timestamp | null;
    updatedAt?: Timestamp | null;
};

type MessagePayload = {
    connectionId: string;
    text: string;
    contactIds: string[];
    status: MessageStatus;
    scheduledAt?: Date | null;
};

export function listenMessages(
    clientId: string,
    connectionId: string,
    statusFilter: MessageStatus | "all",
    callback: (messages: BroadcastMessage[]) => void
) {
    const messagesQuery = query(
        collection(db, "messages"),
        where("clientId", "==", clientId)
    );

    return onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs
            .map((document) => {
                const data = document.data() as Omit<BroadcastMessage, "id">;

                return {
                    id: document.id,
                    ...data,
                };
            })
            .filter((message) => message.connectionId === connectionId)
            .filter((message) => {
                if (statusFilter === "all") {
                    return true;
                }

                return message.status === statusFilter;
            });

        callback(messages);
    });
}

export async function createMessage(clientId: string, payload: MessagePayload) {
    const nowStatus = payload.status;

    await addDoc(collection(db, "messages"), {
        clientId,
        connectionId: payload.connectionId,
        text: payload.text,
        contactIds: payload.contactIds,
        status: nowStatus,
        scheduledAt: payload.scheduledAt
            ? Timestamp.fromDate(payload.scheduledAt)
            : null,
        sentAt: nowStatus === "sent" ? serverTimestamp() : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateMessage(
    messageId: string,
    payload: MessagePayload
) {
    await updateDoc(doc(db, "messages", messageId), {
        connectionId: payload.connectionId,
        text: payload.text,
        contactIds: payload.contactIds,
        status: payload.status,
        scheduledAt: payload.scheduledAt
            ? Timestamp.fromDate(payload.scheduledAt)
            : null,
        sentAt: payload.status === "sent" ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteMessage(messageId: string) {
    await deleteDoc(doc(db, "messages", messageId));
}