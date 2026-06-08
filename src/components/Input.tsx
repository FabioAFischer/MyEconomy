import { Text, TextInput, TextInputProps, View } from "react-native";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-slate-700">{label}</Text>
      <TextInput
        className={`h-12 rounded-lg border bg-white px-4 text-base text-slate-900 ${
          error ? "border-red-500" : "border-slate-300"
        }`}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
