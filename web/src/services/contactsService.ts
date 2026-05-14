import {
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

export type Contact = {
    id: string;
    clientId: string;
    connectionId: string;
    name: string;
    phone: string;
    createdAt?: unknown;
    updatedAt?: unknown;
};

export function listenContacts(
    clientId: string,
    connectionId: string,
    callback: (contacts: Contact[]) => void
) {
    const contactsQuery = query(
        collection(db, "contacts"),
        where("clientId", "==", clientId),
        where("connectionId", "==", connectionId)
    );

    return onSnapshot(contactsQuery, (snapshot) => {
        const contacts = snapshot.docs.map((document) => {
            const data = document.data() as Omit<Contact, "id">;

            return {
                id: document.id,
                ...data,
            };
        });

        callback(contacts);
    });
}

export async function createContact(
    clientId: string,
    connectionId: string,
    data: {
        name: string;
        phone: string;
    }
) {
    await addDoc(collection(db, "contacts"), {
        clientId,
        connectionId,
        name: data.name,
        phone: data.phone,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateContact(
    contactId: string,
    data: {
        name: string;
        phone: string;
    }
) {
    await updateDoc(doc(db, "contacts", contactId), {
        name: data.name,
        phone: data.phone,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteContact(contactId: string) {
    await deleteDoc(doc(db, "contacts", contactId));
}