export const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export const getEventTypeConfig = (type) => {
    const configs = {
        oncampus: { color: "primary", label: "Oncampus", icon: "🏢" },
        offcampus: { color: "secondary", label: "Offcampus", icon: "🌐" },
        hackathon: { color: "warning", label: "Hackathon", icon: "💻" },
        workshop: { color: "success", label: "Workshop", icon: "🎓" },
        post: { color: "info", label: "Opportunity", icon: "💼" },
    };
    return configs[type] || configs.oncampus;
};
