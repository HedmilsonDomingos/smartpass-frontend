// Reusable dropdown (select) with label
export default function Select({ label, children, ...props }) {
  return (
    <label className="flex flex-col">
      {label && <p className="text-sm font-medium pb-2">{label}</p>}
      <select
        className="h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
        {...props}
      >
        {children} {/* <option> items */}
      </select>
    </label>
  );
}