export default function Header({ children }) {
  return (
    <div className="h-14 bg-white border-b flex items-center px-4 space-x-4 shadow-sm">
      {children}
    </div>
  );
}
