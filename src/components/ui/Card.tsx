import { View, type ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({
  elevated = true,
  className,
  children,
  ...props
}: CardProps & { className?: string }) {
  return (
    <View
      className={`rounded-xl bg-white p-4 ${elevated ? 'shadow-sm' : 'border border-slate-200'} ${className ?? ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
