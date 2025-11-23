import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export const inputStyles = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "background.paper",
    borderRadius: 1.5,
    color: "text.primary",
    "& fieldset": {
      borderColor: "#334155",
    },
    "&:hover fieldset": {
      borderColor: "#8b5cf6",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#8b5cf6",
    },
  },
  "& .MuiInputLabel-root": {
    color: "text.secondary",
  },
  "& .MuiSelect-select": {
    color: "text.primary",
  },
  "& .MuiSvgIcon-root": {
    color: "text.secondary",
  },
};

export const StyledTextField = ({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  ...props
}) => (
  <TextField
    fullWidth
    label={label}
    type={type}
    value={value}
    onChange={onChange}
    required={required}
    sx={inputStyles}
    {...props}
  />
);

export const StyledSelect = ({
  label,
  value,
  onChange,
  options,
  required = false,
}) => (
  <FormControl fullWidth sx={inputStyles}>
    <InputLabel sx={{ color: "text.secondary" }}>{label}</InputLabel>
    <Select
      value={value}
      onChange={(e) => onChange(e)}
      label={label}
      required={required}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export const roleOptions = [
  { value: "student", label: "Student" },
  { value: "placement", label: "Placement Cell" },
  { value: "recruiter", label: "Recruiter" },
];

export const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const branchOptions = [
  { value: "CSE", label: "Computer Science Engineering" },
  { value: "IT", label: "Information Technology" },
  { value: "AIML", label: "Artificial Intelligence & Machine Learning" },
  { value: "ECE", label: "Electronics & Communication Engineering" },
  { value: "EEE", label: "Electrical & Electronics Engineering" },
  { value: "CIVIL", label: "Civil Engineering" },
  { value: "MECH", label: "Mechanical Engineering" },
  { value: "MBA", label: "Master of Business Administration" },
  { value: "MCA", label: "Master of Computer Applications" },
];

export const collegeOptions = [
  {
    value: "Meenakshi College Of Engineering",
    label: "Meenakshi College Of Engineering",
  },
];

export const semesterOptions = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
  { value: "3", label: "Semester 3" },
  { value: "4", label: "Semester 4" },
  { value: "5", label: "Semester 5" },
  { value: "6", label: "Semester 6" },
  { value: "7", label: "Semester 7" },
  { value: "8", label: "Semester 8" },
];
