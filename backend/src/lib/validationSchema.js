import { z } from "zod";

// Common password regex
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

// Weak passwords to reject
// const weakPasswords = [
//   "password",
//   "12345678",
//   "password123",
//   "test@123",
//   "admin123",
//   "test123",
// ];

// ============= BASE SCHEMAS =============

export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    passwordRegex,
    "Password must contain uppercase, lowercase, number, and special character"
  );
// .refine(
//   (pwd) => !weakPasswords.some((weak) => pwd.toLowerCase().includes(weak)),
//   {
//     message: "This password is too common. Choose a more unique password",
//   }
// );

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Phone must be 10 digits starting with 6-9")
  .optional()
  .or(z.literal(""));

export const percentageSchema = z
  .string()
  .regex(/^\d*\.?\d+$/, "Must be a valid number")
  .refine((val) => {
    const num = parseFloat(val);
    return num >= 0 && num <= 100;
  }, "Must be between 0 and 100")
  .optional()
  .or(z.literal(""));

export const cgpaSchema = z
  .string()
  .regex(/^\d*\.?\d+$/, "Must be a valid number")
  .refine((val) => {
    const num = parseFloat(val);
    return num >= 0 && num <= 10;
  }, "CGPA must be between 0 and 10")
  .optional()
  .or(z.literal(""));

export const rollNumberSchema = z
  .string()
  .regex(
    /^[A-Z0-9]{4,15}$/i,
    "Roll number must be 4-15 alphanumeric characters"
  )
  .optional()
  .or(z.literal(""));

export const linkedInSchema = z
  .string()
  .regex(
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
    "Invalid LinkedIn URL"
  )
  .optional()
  .or(z.literal(""));

export const websiteSchema = z
  .string()
  .url("Invalid website URL")
  .optional()
  .or(z.literal(""));

// ============= SIGNUP SCHEMA =============

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["student", "placement", "recruiter"], {
      errorMap: () => ({ message: "Please select a valid role" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ============= STUDENT PROFILE SCHEMA =============

export const studentProfileSchema = z.object({
  career_path: z.enum(["placement", "higher_education", "entrepreneurship"]),
  entry_type: z.enum(["regular", "lateral"]),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  roll_number: rollNumberSchema,
  student_id: z.string().optional().or(z.literal("")),
  contact_number: phoneSchema,
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional()
    .or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  college_name: z
    .enum(["Meenakshi College Of Engineering"], {
      errorMap: () => ({ message: "Please select your college" }),
    })
    .optional()
    .or(z.literal("")),
  branch: z.string().min(1, "Branch is required"),
  current_semester: z
    .enum(["1", "2", "3", "4", "5", "6", "7", "8"])
    .optional()
    .or(z.literal("")),
  cgpa: cgpaSchema,
  tenth_score: percentageSchema,
  twelfth_score: percentageSchema,
  diploma_score: percentageSchema,
  linkedin: linkedInSchema,
  skills: z
    .string()
    .max(500, "Skills must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

// ============= PLACEMENT PROFILE SCHEMA =============

export const placementProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  employee_id: z.string().optional().or(z.literal("")),
  contact_number: phoneSchema,
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional()
    .or(z.literal("")),
  role_designation: z.string().optional().or(z.literal("")),
  department_branch: z.string().optional().or(z.literal("")),
  college_name: z.string().optional().or(z.literal("")),
  linkedin: linkedInSchema,
});

// ============= RECRUITER PROFILE SCHEMA =============

export const recruiterProfileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  company_name: z.string().optional().or(z.literal("")),
  role_designation: z.string().optional().or(z.literal("")),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional()
    .or(z.literal("")),
  industry_sector: z.string().optional().or(z.literal("")),
  website: websiteSchema,
  linkedin: linkedInSchema,
  headquarters_location: z.string().optional().or(z.literal("")),
});

// ============= SIGNIN SCHEMA =============

export const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password is required"),
  role: z.enum(["student", "placement", "recruiter"]),
});

// ============= COMPLETE SIGNUP WITH PROFILE =============

export const completeSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["student", "placement", "recruiter"]),
  profileData: z.union([
    studentProfileSchema,
    placementProfileSchema,
    recruiterProfileSchema,
  ]),
});
