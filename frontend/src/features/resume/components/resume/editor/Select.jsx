/* eslint-disable react-refresh/only-export-components */
import DashboardSelect from "../dashboard/Select";

export function Select({ options = [], value, onChange, placeholder = "Select...", size = "md", pill = false, disabled = false }) {
  const roundedClass = pill ? "rounded-full" : "rounded-xl";
  return (
    <DashboardSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size={size}
      disabled={disabled}
      className={roundedClass}
    />
  );
}

export const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const YEARS = (startYear = 1990) => {
  const current = new Date().getFullYear();
  const arr = [];
  for (let y = current; y >= startYear; y--) {
    arr.push({ value: String(y), label: String(y) });
  }
  return arr;
};

export const CURRENT_YEARS = () => {
  const current = new Date().getFullYear();
  const arr = [{ value: "present", label: "Present" }];
  for (let y = current + 5; y >= 1990; y--) {
    arr.push({ value: String(y), label: String(y) });
  }
  return arr;
};
