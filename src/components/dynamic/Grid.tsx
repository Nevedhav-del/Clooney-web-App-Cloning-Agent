export default function Grid({ children, cols = 2, ...props }) {
  return (
    <div className={`grid grid-cols-${cols} gap-4`} {...props}>
      {children}
    </div>
  );
}
