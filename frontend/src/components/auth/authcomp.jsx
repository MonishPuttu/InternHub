import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export const inputStyles = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#1e293b",
    borderRadius: 1.5,
    color: "#e2e8f0",
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
    color: "#94a3b8",
  },
  "& .MuiSelect-select": {
    color: "#e2e8f0",
  },
  "& .MuiSvgIcon-root": {
    color: "#94a3b8",
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
    <InputLabel sx={{ color: "#94a3b8" }}>{label}</InputLabel>
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
