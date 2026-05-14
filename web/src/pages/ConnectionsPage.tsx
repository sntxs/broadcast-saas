import {
    Add,
    Delete,
    Edit,
} from "@mui/icons-material";
import {
    Alert,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import {
    createConnection,
    deleteConnection,
    listenConnections,
    updateConnection,
} from "../services/connectionsService";

import { LoadingState } from "../components/LoadingState";

import type { Connection } from "../services/connectionsService";

export function ConnectionsPage() {
    const { user } = useAuth();

    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
    const [name, setName] = useState("");

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) {
            return;
        }

        const unsubscribe = listenConnections(user.uid, (items) => {
            setConnections(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    function openCreateDialog() {
        setSelectedConnection(null);
        setName("");
        setError("");
        setDialogOpen(true);
    }

    function openEditDialog(connection: Connection) {
        setSelectedConnection(connection);
        setName(connection.name);
        setError("");
        setDialogOpen(true);
    }

    function closeDialog() {
        setDialogOpen(false);
        setSelectedConnection(null);
        setName("");
        setError("");
    }

    async function handleSave() {
        if (!user) {
            return;
        }

        if (!name.trim()) {
            setError("Informe o nome da conexão.");
            return;
        }

        try {
            setSaving(true);

            if (selectedConnection) {
                await updateConnection(selectedConnection.id, name.trim());
            } else {
                await createConnection(user.uid, name.trim());
            }

            closeDialog();
        } catch {
            setError("Não foi possível salvar a conexão.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(connection: Connection) {
        const confirmed = window.confirm(
            `Deseja realmente excluir a conexão "${connection.name}"?`
        );

        if (!confirmed) {
            return;
        }

        await deleteConnection(connection.id);
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
                <div>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Conexões
                    </Typography>

                    <Typography sx={{ mt: 1, color: "#64748b" }}>
                        Cadastre e gerencie as conexões disponíveis para este cliente.
                    </Typography>
                </div>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={openCreateDialog}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                        px: 3,
                        py: 1.2,
                    }}
                >
                    Nova conexão
                </Button>
            </div>

            <Card
                sx={{
                    borderRadius: 4,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 18px 60px rgba(15,23,42,0.04)",
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <LoadingState message="Carregando conexões..." />
                    ) : connections.length === 0 ? (
                        <div className="p-10 text-center">
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Nenhuma conexão cadastrada
                            </Typography>

                            <Typography sx={{ mt: 1, color: "#64748b" }}>
                                Crie sua primeira conexão para começar a organizar contatos.
                            </Typography>

                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={openCreateDialog}
                                sx={{
                                    mt: 3,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 700,
                                }}
                            >
                                Criar conexão
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800 }}>Nome</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                                        Ações
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {connections.map((connection) => (
                                    <TableRow key={connection.id} hover>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 700 }}>
                                                {connection.name}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="right">
                                            <IconButton onClick={() => openEditDialog(connection)}>
                                                <Edit />
                                            </IconButton>

                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(connection)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {selectedConnection ? "Editar conexão" : "Nova conexão"}
                </DialogTitle>

                <DialogContent>
                    <div className="space-y-4 pt-2">
                        {error && <Alert severity="error">{error}</Alert>}

                        <TextField
                            label="Nome da conexão"
                            fullWidth
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            autoFocus
                        />
                    </div>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={closeDialog}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 700,
                        }}
                    >
                        {saving ? "Salvando..." : "Salvar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}