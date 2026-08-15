export interface UgandaBoundaryProps {
  d: string;
}

export function UgandaBoundary({ d }: UgandaBoundaryProps) {
  return (
    <path
      d={d}
      className="fill-white stroke-primary"
      strokeWidth={1.25}
      strokeLinejoin="round"
    />
  );
}
