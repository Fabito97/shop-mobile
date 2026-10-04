import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface LuxuryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function LuxuryButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}: LuxuryButtonProps) {
  let bgStyles = 'bg-gold border-gold';
  let textStyles = 'text-ink font-semibold';

  if (variant === 'secondary') {
    bgStyles = 'bg-charcoal border-gold/40';
    textStyles = 'text-ivory font-medium';
  } else if (variant === 'outline') {
    bgStyles = 'bg-transparent border-gold/50';
    textStyles = 'text-gold font-medium';
  } else if (variant === 'danger') {
    bgStyles = 'bg-danger border-danger';
    textStyles = 'text-ivory font-semibold';
  }

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`py-3.5 px-6 rounded-md border items-center justify-center flex-row gap-2 ${bgStyles} ${
        isDisabled ? 'opacity-60' : 'opacity-100'
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#0B0D0E' : '#C5A880'} size="small" />
      ) : (
        <Text className={`text-xs uppercase tracking-[0.2em] ${textStyles}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
