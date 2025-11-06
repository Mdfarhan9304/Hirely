import React, { forwardRef } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label: string;
  errorText?: string | null;
};

const TextField = forwardRef<TextInput, Props>(({ label, errorText, className, ...rest }, ref) => {
  const hasError = Boolean(errorText);
  return (
    <View >
      <Text className="text-sm text-white mb-3 font-semibold">{label}</Text>
      <TextInput
        ref={ref}
        className={`w-full px-5 py-4 rounded-full border bg-white/50 backdrop-blur-sm text-gray-900 font-medium ${
          hasError ? 'border-red-400/60' : 'border-white/60'
        } ${className || ''}`}
        placeholderTextColor="black"
        {...rest}
      />
      {hasError ? (
        <Text className="text-xs text-red-600 mt-2 font-medium">{errorText}</Text>
      ) : null}
    </View>
  );
});

export default TextField;


