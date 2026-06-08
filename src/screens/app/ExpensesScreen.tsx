import { Text, View } from "react-native";

export default function ExpensesScreen() {
  return (
    <View className="flex-1 bg-slate-50 px-6 pt-16">
      <Text className="text-3xl font-bold text-slate-950">Despesas</Text>
      <Text className="mt-3 text-base leading-6 text-slate-600">
        Área reservada para cadastro e acompanhamento de despesas.
      </Text>
    </View>
  );
}
