import {
    AccountTree,
    Contacts,
    Dashboard as DashboardIcon,
    Logout,
    Message,
} from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { NavLink, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { processScheduledMessagesFromClient } from "../services/scheduledMessagesProcessor";

import { useAuth } from "../contexts/AuthContext";

const menuItems = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: <DashboardIcon fontSize="small" />,
    },
    {
        label: "Conexões",
        path: "/connections",
        icon: <AccountTree fontSize="small" />,
    },
    {
        label: "Contatos",
        path: "/contacts",
        icon: <Contacts fontSize="small" />,
    },
    {
        label: "Mensagens",
        path: "/messages",
        icon: <Message fontSize="small" />,
    },
];

export function AppLayout() {
    const { user, logout } = useAuth();

    useEffect(() => {
        if (!user) {
            return;
        }

        processScheduledMessagesFromClient(user.uid);

        const interval = window.setInterval(() => {
            processScheduledMessagesFromClient(user.uid);
        }, 30000);

        return () => window.clearInterval(interval);
    }, [user]);

    return (
        <main className="min-h-screen bg-slate-50">
            <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-slate-200 bg-white p-6 md:flex md:flex-col">
                <div className="mb-10">
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        Broadcast
                    </Typography>

                    <Typography sx={{ mt: 0.5, color: "#64748b", fontSize: 14 }}>
                        Painel SaaS
                    </Typography>
                </div>

                <nav className="flex flex-1 flex-col gap-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                [
                                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                                    isActive
                                        ? "bg-[#cccccc] text-white"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                                ].join(" ")
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                        Logado como
                    </Typography>

                    <Typography sx={{ fontWeight: 700, fontSize: 14, wordBreak: "break-all" }}>
                        {user?.email}
                    </Typography>

                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Logout />}
                        onClick={logout}
                        sx={{
                            mt: 2,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 700,
                        }}
                    >
                        Sair
                    </Button>
                </div>
            </aside>

            <section className="md:pl-72">
                <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <Typography sx={{ fontWeight: 800 }}>
                                Área administrativa
                            </Typography>

                            <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                                Gerencie conexões, contatos e mensagens.
                            </Typography>
                        </div>

                        <Button
                            variant="outlined"
                            startIcon={<Logout />}
                            onClick={logout}
                            sx={{
                                display: { md: "none" },
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 700,
                            }}
                        >
                            Sair
                        </Button>
                    </div>

                    <nav className="flex gap-2 overflow-x-auto px-6 pb-4 md:hidden">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    [
                                        "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
                                        isActive
                                            ? "bg-slate-950 text-white"
                                            : "bg-slate-100 text-slate-600",
                                    ].join(" ")
                                }
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </header>

                <div className="p-6">
                    <Outlet />
                </div>
            </section>
        </main>
    );
}