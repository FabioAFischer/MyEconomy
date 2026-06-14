import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import { useAuthStore } from "../../stores/authStore";
import { useFinanceStore } from "../../stores/financeStore";

export default function LimitScreen() {
  const user = useAuthStore((state) => state.getCurrentUser());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthRef());
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const [valueError, setValueError] = useState("");

  const existingLimit = useFinanceStore((state) =>
    state.monthlyLimits.find(
      (l) => l.userId === user?.id && l.monthRef === selectedMonth
    )
  );
  const addMonthlyLimit = useFinanceStore((state) => state.addMonthlyLimit);
  const updateMonthlyLimit = useFinanceStore((state) => state.updateMonthlyLimit);
  const deleteMonthlyLimit = useFinanceStore((state) => state.deleteMonthlyLimit);

  const currentMonthRef = getCurrentMonthRef();
  const isPastMonth = selectedMonth < currentMonthRef;
  const showForm = !isPastMonth && (!existingLimit || isEditing);

  function resetForm() {
    setIsEditing(false);
    setValue("");
    setValueError("");
  }

  function handleSave() {
    setValueError("");
    const parsed = parseFloat(value.replace(",", "."));
    if (!value || isNaN(parsed) || parsed <= 0) {
      setValueError("Informe um valor válido");
      return;
    }

    if (isEditing && existingLimit) {
      updateMonthlyLimit(existingLimit.id, parsed);
    } else {
      addMonthlyLimit({
        userId: user!.id,
        value: parsed,
        monthRef: selectedMonth,
      });
    }
    resetForm();
  }

  function handleStartEdit() {
    if (!existingLimit) return;
    setIsEditing(true);
    setValue(existingLimit.value.toFixed(2).replace(".", ","));
    setValueError("");
  }

  function handleDelete() {
    if (!existingLimit) return;
    Alert.alert(
      "Excluir limite",
      "Tem certeza que deseja excluir o limite deste mês?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            deleteMonthlyLimit(existingLimit.id);
            resetForm();
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerClassName="px-6 pb-8 pt-16"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-3xl font-bold text-slate-950">Limite</Text>
      <Text className="mt-3 text-base leading-6 text-slate-600">
        Defina e acompanhe o limite de gastos de cada mês.
      </Text>

      {showForm && (
        <Card className="mt-8">
          <Text className="mb-4 text-base font-semibold text-slate-950">
            {isEditing ? "Editar limite" : "Novo limite"}
          </Text>
          <View className="gap-4">
            <Input
              label="Valor (R$)"
              placeholder="0,00"
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              error={valueError}
            />
            <View className="flex-row gap-3">
              {isEditing && (
                <View className="flex-1">
                  <Button title="Cancelar" variant="secondary" onPress={resetForm} />
                </View>
              )}
              <View className="flex-1">
                <Button
                  title={isEditing ? "Salvar" : "Cadastrar"}
                  onPress={handleSave}
                />
              </View>
            </View>
          </View>
        </Card>
      )}

      <View className="mt-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-slate-950">Consulta</Text>
          <MonthNavigator
            monthRef={selectedMonth}
            maxMonthRef={addMonths(currentMonthRef, 12)}
            onPrev={() => setSelectedMonth(prevMonth(selectedMonth))}
            onNext={() => setSelectedMonth(nextMonth(selectedMonth))}
          />
        </View>

        {existingLimit && !isEditing ? (
          <Card>
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                <Ionicons name="speedometer-outline" size={18} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-slate-500">
                  Limite de {formatMonthFull(selectedMonth)}
                </Text>
                <Text className="mt-0.5 text-xl font-bold text-brand-600">
                  {formatCurrency(existingLimit.value)}
                </Text>
              </View>
              {!isPastMonth && (
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="h-9 w-9 items-center justify-center rounded-lg bg-slate-100"
                    onPress={handleStartEdit}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil-outline" size={16} color="#475569" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="h-9 w-9 items-center justify-center rounded-lg bg-red-50"
                    onPress={handleDelete}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Card>
        ) : !existingLimit ? (
          <Card>
            <Text className="text-center text-sm text-slate-400">
              Nenhum limite encontrado
            </Text>
          </Card>
        ) : null}
      </View>
    </ScrollView>
  );
}

type MonthNavigatorProps = {
  monthRef: string;
  maxMonthRef: string;
  onPrev: () => void;
  onNext: () => void;
};

function MonthNavigator({
  monthRef,
  maxMonthRef,
  onPrev,
  onNext,
}: MonthNavigatorProps) {
  const canGoNext = monthRef < maxMonthRef;
  return (
    <View className="flex-row items-center gap-1">
      <TouchableOpacity
        className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100"
        onPress={onPrev}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back-outline" size={16} color="#475569" />
      </TouchableOpacity>
      <Text className="w-24 text-center text-xs font-medium text-slate-600">
        {formatMonthNav(monthRef)}
      </Text>
      <TouchableOpacity
        className={`h-8 w-8 items-center justify-center rounded-lg bg-slate-100 ${!canGoNext ? "opacity-30" : ""}`}
        onPress={onNext}
        disabled={!canGoNext}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-forward-outline" size={16} color="#475569" />
      </TouchableOpacity>
    </View>
  );
}

function addMonths(monthRef: string, n: number): string {
  const [y, m] = monthRef.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getCurrentMonthRef() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function prevMonth(monthRef: string): string {
  const [y, m] = monthRef.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(monthRef: string): string {
  const [y, m] = monthRef.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthNav(monthRef: string): string {
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  const [y, m] = monthRef.split("-");
  return `${months[Number(m) - 1]}/${y}`;
}

function formatMonthFull(monthRef: string): string {
  const [year, month] = monthRef.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}
