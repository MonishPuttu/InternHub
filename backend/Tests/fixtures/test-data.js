export const TEST_USERS = {
  student: {
    id: "00000000-0000-0000-0000-000000000001",
    email: "student@gmail.com",
    password: "1234567890",
    role: "student",
  },
  recruiter: {
    id: "00000000-0000-0000-0000-000000000002",
    email: "recruiter@gmail.com",
    password: "1234567890",
    role: "recruiter",
  },
  placement: {
    id: "00000000-0000-0000-0000-000000000003",
    email: "placementcell@gmail.com",
    password: "1234567890",
    role: "placement",
  },
};

export const TEST_STUDENT_PROFILE = {
  full_name: "Test Student",
  branch: "CSE",
  current_semester: "07",
  cgpa: "8.5",
  tenth_score: "90",
  twelfth_score: "85",
  contact_number: "+91-9876543210",
};

export const TEST_POST = {
  company_name: "Test Company",
  position: "Software Engineer Intern",
  industry: "Technology",
  application_deadline: new Date("2025-12-31"),
  approval_status: "approved",
  package_offered: "10.00",
  target_departments: ["CSE", "IT"],
};

export const TEST_APPLICATION = {
  full_name: "Test Student",
  email: "student@gmail.com",
  roll_number: "CS21001",
  branch: "CSE",
  current_semester: "07",
  cgpa: "8.5",
  tenth_score: "90",
  twelfth_score: "85",
  contact_number: "+91-9876543210",
};

export const BRANCHES = ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"];
export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Manufacturing",
  "Consulting",
];
export const APPLICATION_STATUSES = [
  "applied",
  "interview_scheduled",
  "interviewed",
  "offer_pending",
  "offer_approved",
  "rejected",
];
