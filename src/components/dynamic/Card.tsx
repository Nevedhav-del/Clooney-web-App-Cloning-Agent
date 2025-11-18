export default function Card({ children, ...props }) {
  return (
    <div className="p-3 border rounded mb-2 bg-white" {...props}>
      {children}
    </div>
  );
}
