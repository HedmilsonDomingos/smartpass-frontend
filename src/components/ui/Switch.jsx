// Toggle switch (on/off) - used in Settings
export default function Switch({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-base text-gray-600 dark:text-gray-400">{label}</span>
      <div className="relative">
        {/* Hidden checkbox */}
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        {/* Visual toggle */}
        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
      </div>
    </label>
  );
}