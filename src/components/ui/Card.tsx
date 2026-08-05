import { Text, View, type ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  title?: string;
  subtitle?: string;
}

export function Card({
  elevated = true,
  title,
  subtitle,
  className,
  children,
  ...props
}: CardProps & { className?: string }) {
  return (
    <View
      className={`rounded-2xl bg-white p-4 ${
        elevated ? 'shadow-sm border border-slate-100' : 'border border-slate-200'
      } ${className ?? ''}`}
      {...props}
    >
      {title ? (
        <View className="mb-3">
          <Text className="text-base font-bold text-slate-900">{title}</Text>
          {subtitle ? <Text className="mt-0.5 text-sm text-slate-500">{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}
