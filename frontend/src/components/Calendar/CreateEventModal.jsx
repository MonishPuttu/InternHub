import { useState } from "react";
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

export default function CreateEventModal({ open, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        title: "",
        eventDate: "",
        eventTime: "",
        eventType: "oncampus",
        location: "",
        endTime: "",
        eligibleStudents: "",
        description: "",
    });

    const handleSubmit = async () => {
        const success = await onSubmit(formData);
        if (success) {
            setFormData({
                title: "",
                eventDate: "",
                eventTime: "",
                eventType: "oncampus",
                location: "",
                endTime: "",
                eligibleStudents: "",
                description: "",
            });
            onClose();
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
                    Create New Event
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
                        required
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Google Campus Drive"
                    />

                    <Stack direction="row" spacing={2}>
                        <TextField
                            fullWidth
                            label="Event Date"
                            type="date"
                            required
                            value={formData.eventDate}
                            onChange={(e) =>
                                setFormData({ ...formData, eventDate: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label="Start Time"
                            type="time"
                            required
                            value={formData.eventTime}
                            onChange={(e) =>
                                setFormData({ ...formData, eventTime: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>

                    <Stack direction="row" spacing={2}>
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
                        label="Location"
                        value={formData.location}
                        onChange={(e) =>
                            setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="Auditorium A"
                    />

                    <TextField
                        fullWidth
                        label="Eligible Students"
                        value={formData.eligibleStudents}
                        onChange={(e) =>
                            setFormData({ ...formData, eligibleStudents: e.target.value })
                        }
                        placeholder="SDE, SDE-2"
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
                        placeholder="Event description..."
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    Create Event
                </Button>
            </DialogActions>
        </Dialog>
    );
}
