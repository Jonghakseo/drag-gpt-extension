type ConditionalRenderProps = {
  isRender: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export default function ConditionalRender({
  isRender,
  children,
  fallback,
}: ConditionalRenderProps) {
  return isRender ? <>{children}</> : <>{fallback}</>;
}
