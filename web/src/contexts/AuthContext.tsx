import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import type { ReactNode } from "react";

import { auth, db } from "../firebase/config";

type AuthContextData = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    async function login(email: string, password: string) {
        await signInWithEmailAndPassword(auth, email, password);
    }

    async function register(name: string, email: string, password: string) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "clients", credential.user.uid), {
            name,
            email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    async function logout() {
        await signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth precisa ser usado dentro de AuthProvider");
    }

    return context;
}