import {
    AccountTree,
    Contacts,
    Message,
} from "@mui/icons-material";
import {
    Card,
    CardContent,
    Chip,
    Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

const cards = [
    {
        title: "Conexões",
        description: "Cadastre e gerencie conexões do cliente.",
        icon: <AccountTree />,
        path: "/connections",
    },
    {
        title: "Contatos",
        description: "Organize contatos vinculados a uma conexão.",
        icon: <Contacts />,
        path: "/contacts",
    },
    {
        title: "Mensagens",
        description: "Crie envios fake, envie ou agende mensagens.",
        icon: <Message />,
        path: "/messages",
    },
];

export function DashboardPage() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-[28px] space-y-6 border border-slate-200 bg-white p-8 shadow-sm">
                <Chip label="Resumo do sistema" sx={{ mb: 2, fontWeight: 700 }} />

                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Bem-vindo ao painel
                </Typography>

                <Typography sx={{ mt: 1, maxWidth: 720, color: "#64748b", lineHeight: 1.7 }}>
                    Gerencie conexões, contatos e mensagens em uma estrutura multi-cliente,
                    mantendo cada usuário com acesso apenas aos próprios dados.
                </Typography>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                {cards.map((card) => (
                    <Link key={card.title} to={card.path} className="no-underline">
                        <Card
                            sx={{
                                height: "100%",
                                borderRadius: 4,
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 18px 60px rgba(15,23,42,0.05)",
                                transition: "0.2s",
                                "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 24px 80px rgba(15,23,42,0.08)",
                                },
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    {card.icon}
                                </div>

                                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                                    {card.title}
                                </Typography>

                                <Typography sx={{ mt: 1, color: "#64748b", lineHeight: 1.6 }}>
                                    {card.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}