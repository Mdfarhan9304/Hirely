import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import AnimatedProgressBar from "./AnimatedProgressBar";

type SingleInputStepProps = {
  question: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onNext: () => void;
  onClose?: () => void;
  onBack?: () => void;
  disabled?: boolean;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  error?: string | null;
  required?: boolean;
  completionProgress?: number;
};

export default function SingleInputStep({
  question,
  placeholder,
  value,
  onChangeText,
  onNext,
  onClose,
  onBack,
  disabled = false,
  multiline = false,
  keyboardType = "default",
  error,
  required = true,
  completionProgress,
}: SingleInputStepProps) {
  const inputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  const canProceed = (!required || value.trim().length > 0) && !disabled;

  return (
    <View className="flex-1 bg-white">
      {/* Progress Bar */}
      {completionProgress !== undefined && (
        <View className="px-6 pt-12 pb-4">
          <AnimatedProgressBar
            progress={completionProgress}
            height={6}
            showPercentage={true}
          />
        </View>
      )}
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-8">
        <View className="w-10">
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
          )}
        </View>
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 pt-8">
        <View className="flex-row items-start mb-12">
          <View className="w-1 h-12 bg-\[#50c8eb\] mr-4 mt-2 rounded-full" />
          <Text
            className="flex-1 text-4xl items-start font-bold text-gray-900 font-poppins"
            style={{ lineHeight: 48 }}
          >
            {question}
          </Text>
        </View>

        {/* Input Field */}
        <View className="mb-8">
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            keyboardType={keyboardType}
            className="text-2xl font-poppins text-gray-900 border-b-2"
            style={{
              borderBottomColor: error
                ? "#EF4444"
                : value.trim().length > 0
                  ? "#50c8eb"
                  : "#D1D5DB",
              textAlignVertical: multiline ? "top" : "center",

              paddingVertical: multiline ? 8 : 0,
            }}
            autoFocus
            autoCapitalize={multiline ? "sentences" : "words"}
            editable={!disabled}
          />

          {error && (
            <Text className="text-red-500 text-sm font-poppins mt-2">
              {error}
            </Text>
          )}
        </View>
      </View>

      {/* Next Button */}
      <View className="absolute bottom-8 right-6">
        <TouchableOpacity
          onPress={onNext}
          disabled={!canProceed}
          className={`w-16 h-16 rounded-full items-center justify-center ${
            canProceed ? "bg-[#50c8eb]" : "bg-gray-300"
          }`}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-forward"
            size={28}
            color={canProceed ? "white" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
