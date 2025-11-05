// Button component - reusable across all pages
// Supports variants (primary, secondary, danger) and sizes (sm, md, lg)

export default function Button({ 
  children,           // Button text or icons
  variant = "primary", // Color style
  size = "md",        // Height & padding
  ...props            // onClick, type, etc.
}) {
  // Tailwind classes for different button styles
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
  };

  // Tailwind classes for different sizes
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-base"
  };

  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-lg font-medium transition ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}