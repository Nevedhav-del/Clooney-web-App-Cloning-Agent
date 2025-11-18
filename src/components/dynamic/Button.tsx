export default function Button({ children, ...props }) {
  return (
    <button
      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      {...props}
    >
      {children}
    </button>
  );
}
