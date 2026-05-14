import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

import { db } from "../firebase/config";

export type Connection = {
    id: string;
    clientId: string;
    name: string;
    createdAt?: unknown;
    updatedAt?: unknown;
};

export function listenConnections(
    clientId: string,
    callback: (connections: Connection[]) => void
) {
    const connectionsQuery = query(
        collection(db, "connections"),
        where("clientId", "==", clientId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(connectionsQuery, (snapshot) => {
        const connections = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
        })) as Connection[];

        callback(connections);
    });
}

export async function createConnection(clientId: string, name: string) {
    await addDoc(collection(db, "connections"), {
        clientId,
        name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateConnection(connectionId: string, name: string) {
    await updateDoc(doc(db, "connections", connectionId), {
        name,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteConnection(connectionId: string) {
    await deleteDoc(doc(db, "connections", connectionId));
}