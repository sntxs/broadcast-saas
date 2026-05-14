import { CircularProgress, Typography } from "@mui/material";

type LoadingStateProps = {
    message?: string;
};

export function LoadingState({ message = "Carregando informações..." }: LoadingStateProps) {
    return (
        <div className="flex min-h-55 flex-col items-center justify-center gap-4 p-8">
            <CircularProgress size={34} thickness={4} />

            <Typography sx={{ color: "#64748b", fontWeight: 600 }}>
                {message}
            </Typography>
        </div>
    );
}