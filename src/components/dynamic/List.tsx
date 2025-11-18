export default function List({ children, ...props }) {
  return (
    <div className="flex flex-col gap-2" {...props}>
      {children}
    </div>
  );
}
