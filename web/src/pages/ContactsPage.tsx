import { Add, Delete, Edit } from "@mui/icons-material";
import {
    Alert,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import {
    createContact,
    deleteContact,
    listenContacts,
    updateContact,
} from "../services/contactsService";
import { listenConnections } from "../services/connectionsService";

import type { Contact } from "../services/contactsService";
import type { Connection } from "../services/connectionsService";

export function ContactsPage() {
    const { user } = useAuth();

    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedConnectionId, setSelectedConnectionId] = useState("");

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loadingConnections, setLoadingConnections] = useState(true);
    const [loadedConnectionId, setLoadedConnectionId] = useState<string | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const selectedConnection = useMemo(() => {
        return connections.find((connection) => connection.id === selectedConnectionId);
    }, [connections, selectedConnectionId]);

    const isLoadingContacts =
        Boolean(selectedConnectionId) && loadedConnectionId !== selectedConnectionId;

    useEffect(() => {
        if (!user) {
            return;
        }

        const unsubscribe = listenConnections(user.uid, (items) => {
            setConnections(items);
            setLoadingConnections(false);

            if (items.length === 0) {
                setSelectedConnectionId("");
                setContacts([]);
                setLoadedConnectionId(null);
                return;
            }

            setSelectedConnectionId((currentConnectionId) => {
                const currentConnectionStillExists = items.some(
                    (connection) => connection.id === currentConnectionId
                );

                if (currentConnectionId && currentConnectionStillExists) {
                    return currentConnectionId;
                }

                return items[0].id;
            });
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (!user || !selectedConnectionId) {
            return;
        }

        const unsubscribe = listenContacts(user.uid, selectedConnectionId, (items) => {
            setContacts(items);
            setLoadedConnectionId(selectedConnectionId);
        });

        return () => unsubscribe();
    }, [user, selectedConnectionId]);

    function openCreateDialog() {
        setSelectedContact(null);
        setName("");
        setPhone("");
        setError("");
        setDialogOpen(true);
    }

    function openEditDialog(contact: Contact) {
        setSelectedContact(contact);
        setName(contact.name);
        setPhone(contact.phone);
        setError("");
        setDialogOpen(true);
    }

    function closeDialog() {
        setDialogOpen(false);
        setSelectedContact(null);
        setName("");
        setPhone("");
        setError("");
    }

    async function handleSave() {
        if (!user) {
            return;
        }

        if (!selectedConnectionId) {
            setError("Selecione uma conexão antes de cadastrar o contato.");
            return;
        }

        if (!name.trim() || !phone.trim()) {
            setError("Informe nome e telefone do contato.");
            return;
        }

        try {
            setSaving(true);

            const contactData = {
                name: name.trim(),
                phone: phone.trim(),
            };

            if (selectedContact) {
                await updateContact(selectedContact.id, contactData);
            } else {
                await createContact(user.uid, selectedConnectionId, contactData);
            }

            closeDialog();
        } catch (error) {
            console.error(error);
            setError("Não foi possível salvar o contato.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(contact: Contact) {
        const confirmed = window.confirm(
            `Deseja realmente excluir o contato "${contact.name}"?`
        );

        if (!confirmed) {
            return;
        }

        await deleteContact(contact.id);
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
                <div>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Contatos
                    </Typography>

                    <Typography sx={{ mt: 1, color: "#64748b" }}>
                        Gerencie contatos vinculados a uma conexão específica.
                    </Typography>
                </div>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={openCreateDialog}
                    disabled={!selectedConnectionId}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                        px: 3,
                        py: 1.2,
                    }}
                >
                    Novo contato
                </Button>
            </div>

            <Card
                sx={{
                    borderRadius: 4,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 18px 60px rgba(15,23,42,0.04)",
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    {loadingConnections ? (
                        <LoadingState message="Carregando conexões..." />
                    ) : connections.length === 0 ? (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Cadastre uma conexão antes de criar contatos.
                        </Alert>
                    ) : (
                        <>
                            <FormControl fullWidth>
                                <InputLabel>Conexão</InputLabel>

                                <Select
                                    label="Conexão"
                                    value={selectedConnectionId}
                                    onChange={(event) => {
                                        setSelectedConnectionId(event.target.value);
                                        setLoadedConnectionId(null);
                                    }}
                                >
                                    {connections.map((connection) => (
                                        <MenuItem key={connection.id} value={connection.id}>
                                            {connection.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {selectedConnection && (
                                <Typography sx={{ mt: 2, color: "#64748b", fontSize: 14 }}>
                                    Exibindo contatos da conexão:{" "}
                                    <strong>{selectedConnection.name}</strong>
                                </Typography>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Card
                sx={{
                    borderRadius: 4,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 18px 60px rgba(15,23,42,0.04)",
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    {isLoadingContacts ? (
                        <LoadingState message="Carregando contatos..." />
                    ) : contacts.length === 0 ? (
                        <div className="p-10 text-center">
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Nenhum contato cadastrado
                            </Typography>

                            <Typography sx={{ mt: 1, color: "#64748b" }}>
                                Selecione uma conexão e cadastre o primeiro contato.
                            </Typography>

                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={openCreateDialog}
                                disabled={!selectedConnectionId}
                                sx={{
                                    mt: 3,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 700,
                                }}
                            >
                                Criar contato
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800 }}>Nome</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Telefone</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                                        Ações
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {contacts.map((contact) => (
                                    <TableRow key={contact.id} hover>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 700 }}>
                                                {contact.name}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography sx={{ color: "#64748b" }}>
                                                {contact.phone}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="right">
                                            <IconButton onClick={() => openEditDialog(contact)}>
                                                <Edit />
                                            </IconButton>

                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(contact)}
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
                    {selectedContact ? "Editar contato" : "Novo contato"}
                </DialogTitle>

                <DialogContent>
                    <div className="space-y-4 pt-2">
                        {error && <Alert severity="error">{error}</Alert>}

                        <TextField
                            label="Nome do contato"
                            fullWidth
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            autoFocus
                        />

                        <TextField
                            label="Telefone"
                            fullWidth
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            placeholder="(00) 00000-0000"
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