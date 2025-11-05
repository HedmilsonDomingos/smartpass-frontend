// Reusable input field with label
export default function Input({ label, ...props }) {
  return (
    <label className="flex flex-col">
      {/* Optional label above input */}
      {label && <p className="text-sm font-medium pb-2">{label}</p>}
      <input
        // Clean, modern input with dark mode support
        className="h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
        {...props} // value, onChange, type, etc.
      />
    </label>
  );
}