import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    Stack,
    MenuItem,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { getCurrentISTForInput } from "@/lib/dateUtils";

export default function EditEventModal({
    open,
    onClose,
    event,
    onSubmit,
    onDelete,
}) {
    const [formData, setFormData] = useState({
        title: "",
        eventDate: "",
        eventTime: "",
        endTime: "",
        eventType: "oncampus",
        location: "",
        eligibleStudents: "",
        description: "",
    });

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title || "",
                eventDate: event.eventDate || "",
                eventTime: event.eventTime || "",
                endTime: event.endTime || "",
                eventType: event.eventType || "oncampus",
                location: event.location || "",
                eligibleStudents: event.eligibleStudents || "",
                description: event.description || "",
            });
        }
    }, [event]);

    const handleSubmit = async () => {
        if (event) {
            const success = await onSubmit(event.id, formData);
            if (success) {
                onClose();
            }
        }
    };

    const handleDelete = () => {
        if (event) {
            onDelete(event.id);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    Edit Event
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        fullWidth
                        label="Event Title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                    />
                    <TextField
                        fullWidth
                        label="Event Date"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) =>
                            setFormData({ ...formData, eventDate: e.target.value })
                        }
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                            min: getCurrentISTForInput(),
                        }}
                    />
                    <Stack direction="row" spacing={2}>
                        <TextField
                            fullWidth
                            label="Start Time"
                            type="time"
                            value={formData.eventTime}
                            onChange={(e) =>
                                setFormData({ ...formData, eventTime: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label="End Time"
                            type="time"
                            value={formData.endTime}
                            onChange={(e) =>
                                setFormData({ ...formData, endTime: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
                    <TextField
                        fullWidth
                        select
                        label="Event Type"
                        value={formData.eventType}
                        onChange={(e) =>
                            setFormData({ ...formData, eventType: e.target.value })
                        }
                    >
                        <MenuItem value="oncampus">On Campus</MenuItem>
                        <MenuItem value="offcampus">Off Campus</MenuItem>
                        <MenuItem value="hackathon">Hackathon</MenuItem>
                        <MenuItem value="workshop">Workshop</MenuItem>
                    </TextField>
                    <TextField
                        fullWidth
                        label="Location"
                        value={formData.location}
                        onChange={(e) =>
                            setFormData({ ...formData, location: e.target.value })
                        }
                    />
                    <TextField
                        fullWidth
                        label="Eligible Students"
                        value={formData.eligibleStudents}
                        onChange={(e) =>
                            setFormData({ ...formData, eligibleStudents: e.target.value })
                        }
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDelete}
                >
                    Delete
                </Button>
                <Button variant="contained" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}
