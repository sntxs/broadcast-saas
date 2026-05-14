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
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { listenContacts } from "../services/contactsService";
import { listenConnections } from "../services/connectionsService";
import {
    createMessage,
    deleteMessage,
    listenMessages,
    updateMessage,
} from "../services/messagesService";

import type { Contact } from "../services/contactsService";
import type { Connection } from "../services/connectionsService";
import type {
    BroadcastMessage,
    MessageStatus,
} from "../services/messagesService";

type MessageFilter = MessageStatus | "all";
type SubmitMode = "sent" | "scheduled";

function formatDateTimeLocal(date: Date) {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
}

function timestampToDateTimeLocal(message: BroadcastMessage) {
    if (!message.scheduledAt) {
        return "";
    }

    return formatDateTimeLocal(message.scheduledAt.toDate());
}

export function MessagesPage() {
    const { user } = useAuth();

    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedConnectionId, setSelectedConnectionId] = useState("");

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [messages, setMessages] = useState<BroadcastMessage[]>([]);

    const [loadingConnections, setLoadingConnections] = useState(true);
    const [loadedContactsConnectionId, setLoadedContactsConnectionId] =
        useState<string | null>(null);
    const [loadedMessagesConnectionId, setLoadedMessagesConnectionId] =
        useState<string | null>(null);

    const [filter, setFilter] = useState<MessageFilter>("all");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] =
        useState<BroadcastMessage | null>(null);

    const [text, setText] = useState("");
    const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
    const [submitMode, setSubmitMode] = useState<SubmitMode>("sent");
    const [scheduledAt, setScheduledAt] = useState("");

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const selectedConnection = useMemo(() => {
        return connections.find((connection) => connection.id === selectedConnectionId);
    }, [connections, selectedConnectionId]);

    const isLoadingContacts =
        Boolean(selectedConnectionId) &&
        loadedContactsConnectionId !== selectedConnectionId;

    const isLoadingMessages =
        Boolean(selectedConnectionId) &&
        loadedMessagesConnectionId !== selectedConnectionId;

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
                setMessages([]);
                setLoadedContactsConnectionId(null);
                setLoadedMessagesConnectionId(null);
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
            setLoadedContactsConnectionId(selectedConnectionId);
        });

        return () => unsubscribe();
    }, [user, selectedConnectionId]);

    useEffect(() => {
        if (!user || !selectedConnectionId) {
            return;
        }

        const unsubscribe = listenMessages(
            user.uid,
            selectedConnectionId,
            filter,
            (items) => {
                setMessages(items);
                setLoadedMessagesConnectionId(selectedConnectionId);
            }
        );

        return () => unsubscribe();
    }, [user, selectedConnectionId, filter]);

    function openCreateDialog() {
        setSelectedMessage(null);
        setText("");
        setSelectedContactIds([]);
        setSubmitMode("sent");
        setScheduledAt("");
        setError("");
        setDialogOpen(true);
    }

    function openEditDialog(message: BroadcastMessage) {
        setSelectedMessage(message);
        setText(message.text);
        setSelectedContactIds(message.contactIds);
        setSubmitMode(message.status);
        setScheduledAt(timestampToDateTimeLocal(message));
        setError("");
        setDialogOpen(true);
    }

    function closeDialog() {
        setDialogOpen(false);
        setSelectedMessage(null);
        setText("");
        setSelectedContactIds([]);
        setSubmitMode("sent");
        setScheduledAt("");
        setError("");
    }

    function handleChangeContacts(value: unknown) {
        if (typeof value === "string") {
            setSelectedContactIds(value.split(","));
            return;
        }

        setSelectedContactIds(value as string[]);
    }

    async function handleSave() {
        if (!user) {
            return;
        }

        if (!selectedConnectionId) {
            setError("Selecione uma conexão antes de criar uma mensagem.");
            return;
        }

        if (!text.trim()) {
            setError("Informe o conteúdo da mensagem.");
            return;
        }

        if (selectedContactIds.length === 0) {
            setError("Selecione pelo menos um contato.");
            return;
        }

        if (submitMode === "scheduled" && !scheduledAt) {
            setError("Informe a data e hora do agendamento.");
            return;
        }

        const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;

        if (submitMode === "scheduled" && scheduledDate && scheduledDate <= new Date()) {
            setError("A data de agendamento precisa ser futura.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                connectionId: selectedConnectionId,
                text: text.trim(),
                contactIds: selectedContactIds,
                status: submitMode,
                scheduledAt: submitMode === "scheduled" ? scheduledDate : null,
            };

            if (selectedMessage) {
                await updateMessage(selectedMessage.id, payload);
            } else {
                await createMessage(user.uid, payload);
            }

            closeDialog();
        } catch (error) {
            console.error(error);
            setError("Não foi possível salvar a mensagem.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(message: BroadcastMessage) {
        const confirmed = window.confirm("Deseja realmente excluir esta mensagem?");

        if (!confirmed) {
            return;
        }

        await deleteMessage(message.id);
    }

    function getContactsLabel(contactIds: string[]) {
        const names = contacts
            .filter((contact) => contactIds.includes(contact.id))
            .map((contact) => contact.name);

        if (names.length === 0) {
            return "Contatos não encontrados";
        }

        return names.join(", ");
    }

    function getStatusChip(status: MessageStatus) {
        if (status === "sent") {
            return <Chip label="Enviada" color="success" size="small" />;
        }

        return <Chip label="Agendada" color="warning" size="small" />;
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
                <div>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Mensagens
                    </Typography>

                    <Typography sx={{ mt: 1, color: "#64748b" }}>
                        Crie mensagens fake, selecione contatos e agende disparos.
                    </Typography>
                </div>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={openCreateDialog}
                    disabled={!selectedConnectionId || contacts.length === 0}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                        px: 3,
                        py: 1.2,
                    }}
                >
                    Nova mensagem
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
                            Cadastre uma conexão antes de criar mensagens.
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
                                        setLoadedContactsConnectionId(null);
                                        setLoadedMessagesConnectionId(null);
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
                                    Exibindo mensagens da conexão:{" "}
                                    <strong>{selectedConnection.name}</strong>
                                </Typography>
                            )}

                            {!isLoadingContacts && contacts.length === 0 && (
                                <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
                                    Esta conexão ainda não possui contatos. Cadastre contatos antes
                                    de criar mensagens.
                                </Alert>
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
                    <div className="border-b border-slate-200 px-4">
                        <Tabs
                            value={filter}
                            onChange={(_, value: MessageFilter) => {
                                setFilter(value);
                                setLoadedMessagesConnectionId(null);
                            }}
                        >
                            <Tab value="all" label="Todas" />
                            <Tab value="sent" label="Enviadas" />
                            <Tab value="scheduled" label="Agendadas" />
                        </Tabs>
                    </div>

                    {isLoadingMessages ? (
                        <LoadingState message="Carregando mensagens..." />
                    ) : messages.length === 0 ? (
                        <div className="p-10 text-center">
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Nenhuma mensagem encontrada
                            </Typography>

                            <Typography sx={{ mt: 1, color: "#64748b" }}>
                                Crie uma mensagem para os contatos da conexão selecionada.
                            </Typography>

                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={openCreateDialog}
                                disabled={!selectedConnectionId || contacts.length === 0}
                                sx={{
                                    mt: 3,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 700,
                                }}
                            >
                                Criar mensagem
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800 }}>Mensagem</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Contatos</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Agendamento</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                                        Ações
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {messages.map((message) => (
                                    <TableRow key={message.id} hover>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 700 }}>
                                                {message.text}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography sx={{ color: "#64748b", maxWidth: 260 }}>
                                                {getContactsLabel(message.contactIds)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>{getStatusChip(message.status)}</TableCell>

                                        <TableCell>
                                            <Typography sx={{ color: "#64748b" }}>
                                                {message.scheduledAt
                                                    ? message.scheduledAt.toDate().toLocaleString("pt-BR")
                                                    : "-"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="right">
                                            <IconButton onClick={() => openEditDialog(message)}>
                                                <Edit />
                                            </IconButton>

                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(message)}
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
                    {selectedMessage ? "Editar mensagem" : "Nova mensagem"}
                </DialogTitle>

                <DialogContent>
                    <div className="space-y-4 pt-2">
                        {error && <Alert severity="error">{error}</Alert>}

                        <TextField
                            label="Mensagem"
                            fullWidth
                            multiline
                            minRows={4}
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            autoFocus
                        />

                        <FormControl fullWidth>
                            <InputLabel>Contatos</InputLabel>

                            <Select
                                multiple
                                label="Contatos"
                                value={selectedContactIds}
                                input={<OutlinedInput label="Contatos" />}
                                onChange={(event) => handleChangeContacts(event.target.value)}
                                renderValue={(selected) =>
                                    contacts
                                        .filter((contact) => selected.includes(contact.id))
                                        .map((contact) => contact.name)
                                        .join(", ")
                                }
                            >
                                {contacts.map((contact) => (
                                    <MenuItem key={contact.id} value={contact.id}>
                                        {contact.name} — {contact.phone}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Tipo de envio</InputLabel>

                            <Select
                                label="Tipo de envio"
                                value={submitMode}
                                onChange={(event) =>
                                    setSubmitMode(event.target.value as SubmitMode)
                                }
                            >
                                <MenuItem value="sent">Enviar agora</MenuItem>
                                <MenuItem value="scheduled">Agendar mensagem</MenuItem>
                            </Select>
                        </FormControl>

                        {submitMode === "scheduled" && (
                            <TextField
                                label="Data e hora do agendamento"
                                type="datetime-local"
                                fullWidth
                                value={scheduledAt}
                                onChange={(event) => setScheduledAt(event.target.value)}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                            />
                        )}
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