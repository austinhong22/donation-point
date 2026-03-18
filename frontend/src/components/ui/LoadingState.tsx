interface LoadingStateProps {
  title: string;
  message: string;
}

export function LoadingState({ title, message }: LoadingStateProps) {
  return (
    <div className="state-card">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}
