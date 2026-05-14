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
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export function RegisterPage() {
    const { register, logout } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!name || !email || !password) {
            setError("Preencha todos os campos.");
            return;
        }

        if (password.length < 6) {
            setError("A senha precisa ter pelo menos 6 caracteres.");
            return;
        }

        try {
            setLoading(true);

            await register(name, email, password);

            await logout();

            navigate("/login", {
                state: {
                    successMessage: "Conta criada com sucesso. Agora faça login para continuar.",
                },
            });
        } catch {
            setError("Não foi possível criar sua conta. Verifique os dados informados.");
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
                                maxWidth: 430,
                                borderRadius: 4,
                                boxShadow: "none",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <div className="mb-8">
                                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                        Criar conta
                                    </Typography>

                                    <Typography sx={{ mt: 1, color: "#64748b" }}>
                                        Cadastre-se para acessar o Broadcast SaaS.
                                    </Typography>
                                </div>

                                {error && (
                                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <TextField
                                        label="Nome"
                                        fullWidth
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                    />

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
                                                Criando conta...
                                            </span>
                                        ) : (
                                            "Criar minha conta"
                                        )}
                                    </Button>
                                </form>

                                <Typography sx={{ mt: 4, textAlign: "center", color: "#64748b" }}>
                                    Já tem conta? <Link to="/login">Entrar</Link>
                                </Typography>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </main>
    );
}