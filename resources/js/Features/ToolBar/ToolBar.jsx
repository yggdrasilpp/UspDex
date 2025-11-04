import { useEffect } from 'react';
import { styled } from '@mui/material';
import { Typography } from "@mui/material";

import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import IconWrapper from '../../ui/Icons/IconWrapper';
import { usePlansContext } from '../../Contexts/PlansContext';
import { useViewMode } from '../../Contexts/ViewModeContext';
import { useAuthContext } from '../../Contexts/AuthContext';

const Container = styled("div")({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    color: "white"
});

const StyledText = styled(Typography)(({ theme }) => ({
    display: "none",
    padding: "1px",
    maxWidth: "100%",
    textAlign: "center",
    color: theme.palette.neutral.main,
    ...theme.typography.small,

    [theme.breakpoints.up("sm")]: {
        ...theme.typography.p,
        display: "block",
    }
}));

function ToolBar() {
    const { undo, redo, isSaved } = usePlansContext();
    const { isSuggestedPlansView, toggleSuggestedPlansView } = useViewMode();
    const { user } = useAuthContext();

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.ctrlKey && event.key === "z") {
                undo();
            } else if ((event.ctrlKey && event.key === "y") || (event.ctrlKey && event.shiftKey && event.key === "Z")) {
                redo();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [undo, redo]);

    const handleExport = () => {
        if (user) {
            window.open('/export', '_blank');
        }
    };

    return (
        <Stack>
            <Container>
                <Stack spacing={1} direction="row">
                    <IconWrapper Icon={UndoIcon} onClick={undo} toolTipText="Desfazer ação"/>
                    <IconWrapper Icon={RedoIcon} onClick={redo} toolTipText="Refazer ação"/>
                </Stack>
                <StyledText> {isSuggestedPlansView ? "Você está vendo a grade obrigatória recomendada" : "Arraste uma disciplina para adicioná-la ou removê-la do período desejado"} </StyledText>
                <Stack spacing={1} direction="row">
                    {!isSaved && user && <CircularProgress size={20} color="inherit" />}
                    <IconWrapper
                        Icon={isSuggestedPlansView ? VisibilityOffOutlinedIcon : VisibilityOutlinedIcon}
                        onClick={toggleSuggestedPlansView}
                        toolTipText='Visualizar grade obrigatória'
                    />
                    <IconWrapper Icon={FileDownloadOutlinedIcon}
                                onClick={handleExport}
                                disabled={!user}
                                toolTipText={user ? "Exportar planejamento" : "Faça login para exportar o planejamento"}
                                /> 
                </Stack>
            </Container>
        </Stack>
    );
}

export default ToolBar;