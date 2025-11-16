import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

export default function DeleteConfirmModal({ open, onClose, onConfirm }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>Delete Event</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete this event? This action cannot be
                    undone.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
