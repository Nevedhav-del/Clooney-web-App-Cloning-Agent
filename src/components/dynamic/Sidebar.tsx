export default function Sidebar({ children, ...props }) {
  return (
    <div className="w-[240px] bg-gray-100 h-screen p-4 space-y-2">
      {children}
    </div>
  );
}
