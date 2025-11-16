"use client";
import { useState } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { useRecruiterCalendarEvents } from "@/hooks/useRecruiterCalendarEvents";
import CalendarHeader from "@/components/Calendar/CalendarHeader";
import CalendarFilters from "@/components/Calendar/CalendarFilters";
import EventList from "@/components/Calendar/EventList";
import CreateEventModal from "@/components/Calendar/CreateEventModal";
import EditEventModal from "@/components/Calendar/EditEventModal";
import DeleteConfirmModal from "@/components/Calendar/DeleteConfirmModal";

export default function IntegratedRecruiterCalendar() {
  const {
    events,
    loading,
    filterType,
    setFilterType,
    currentDate,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    createEvent,
    updateEvent,
    deleteEvent,
    handlePrevMonth,
    handleNextMonth,
  } = useRecruiterCalendarEvents();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);

  const handleEventClick = (event) => {
    if (event.source === "post") {
      // Redirect to post details page
      window.location.href = `/Post/postdetails/${event.postId}`;
      return;
    }

    // Open edit modal for calendar events
    setActiveEvent(event);
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (formData) => {
    return await createEvent(formData);
  };

  const handleEditSubmit = async (eventId, formData) => {
    return await updateEvent(eventId, formData);
  };

  const handleDeleteConfirm = async () => {
    if (activeEvent) {
      const success = await deleteEvent(activeEvent.id);
      if (success) {
        setShowDeleteModal(false);
        setShowEditModal(false);
        setActiveEvent(null);
      }
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  if (!currentDate) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <div>Loading...</div>
      </Box>
    );
  }

  return (
    <Box
      sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}
    >
      {/* Header */}
      <CalendarHeader onCreateClick={() => setShowCreateModal(true)} />

      {/* Filters */}
      <CalendarFilters
        currentDate={currentDate}
        filterType={filterType}
        setFilterType={setFilterType}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Events List */}
      <EventList
        events={events}
        loading={loading}
        onEventClick={handleEventClick}
      />

      {/* Modals */}
      <CreateEventModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
      />

      <EditEventModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setActiveEvent(null);
        }}
        event={activeEvent}
        onSubmit={handleEditSubmit}
        onDelete={handleDeleteClick}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Notifications */}
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={4000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
