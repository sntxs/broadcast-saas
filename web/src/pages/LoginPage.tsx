import {
    Alert,
    Button,
    Card,
    CardContent,
    CircularProgress,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const location = useLocation();

    const successMessage = location.state?.sucessoMessage as string | undefined;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Informe e-mail e senha.");
            return;
        }

        try {
            setLoading(true);
            await login(email, password);
            navigate("/dashboard");
        } catch {
            setError("E-mail ou senha inválidos.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="grid w-full overflow-hidden rounded-4xl">
                <section className="flex items-center justify-center p-6 sm:p-10">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <Typography
                                variant="h3"
                                component="h1"
                                sx={{
                                    fontWeight: 900,
                                    color: "#0f172a",
                                    letterSpacing: "-0.04em",
                                }}
                            >
                                Teste Dev Fullstack
                            </Typography>

                            <Typography sx={{ mt: 1.5, color: "#64748b", lineHeight: 1.6 }}>
                                Plataforma SaaS para gerenciamento de conexões, contatos e mensagens.
                            </Typography>
                        </div>

                        <Card
                            sx={{
                                width: "100%",
                                borderRadius: 4,
                                boxShadow: "none",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <div className="mb-8">
                                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                        Entrar
                                    </Typography>

                                    <Typography sx={{ mt: 1, color: "#64748b" }}>
                                        Acesse sua conta para continuar.
                                    </Typography>
                                </div>

                                {successMessage && (
                                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                                        {successMessage}
                                    </Alert>
                                )}

                                {error && (
                                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <TextField
                                        label="E-mail"
                                        type="email"
                                        fullWidth
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                    />

                                    <TextField
                                        label="Senha"
                                        type="password"
                                        fullWidth
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        disabled={loading}
                                        sx={{
                                            mt: 1,
                                            py: 1.4,
                                            borderRadius: 2,
                                            textTransform: "none",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <CircularProgress size={18} color="inherit" />
                                                Entrando...
                                            </span>
                                        ) : (
                                            "Entrar na plataforma"
                                        )}
                                    </Button>
                                </form>

                                <Typography sx={{ mt: 4, textAlign: "center", color: "#64748b" }}>
                                    Não tem conta? <Link to="/register">Criar conta</Link>
                                </Typography>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </main>
    );
}