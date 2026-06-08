import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import ProgressBar from "../../components/ProgressBar";
import { useAuthStore } from "../../stores/authStore";
import { useFinanceStore } from "../../stores/financeStore";
import { MonthlySummary } from "../../types/Finance";

export default function HomeScreen() {
  const user = useAuthStore((state) => state.getCurrentUser());
  const monthRef = getCurrentMonthRef();
  const summary = useFinanceStore((state) =>
    state.getMonthlySummary(user?.id ?? "", monthRef)
  );
  const status = getStatusContent(summary);
  const progressPercentage = Math.round(summary.progress * 100);

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerClassName="px-6 pb-8 pt-16"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-3xl font-bold text-slate-950">Home</Text>
      <Text className="mt-3 text-base leading-6 text-slate-600">
        Visão geral financeira de {getFirstName(user?.name)} em{" "}
        {formatMonth(monthRef)}.
      </Text>

      <View className="mt-8 gap-4">
        <MonthlyTotalCard total={summary.totalExpenses} />

        <View className="flex-row gap-4">
          <SummaryInfoCard
            label="Limite mensal"
            value={summary.limit === null ? "--" : formatCurrency(summary.limit)}
          />
          <SummaryInfoCard
            isDanger={summary.status === "over-limit"}
            label="Saldo"
            value={
              summary.balance === null ? "--" : formatCurrency(summary.balance)
            }
          />
        </View>

        <Card>
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-base font-semibold text-slate-950">
                Uso do limite
              </Text>
              <Text className="mt-1 text-sm text-slate-500">
                {summary.limit === null
                  ? "Cadastre um limite para acompanhar."
                  : `${progressPercentage}% utilizado`}
              </Text>
            </View>
            <View
              className={`rounded-lg px-3 py-2 ${
                summary.status === "over-limit" ? "bg-red-50" : "bg-brand-50"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  summary.status === "over-limit"
                    ? "text-red-600"
                    : "text-brand-700"
                }`}
              >
                {summary.limit === null ? "Sem limite" : `${progressPercentage}%`}
              </Text>
            </View>
          </View>

          <ProgressBar progress={summary.progress} status={summary.status} />
        </Card>

        <StatusCard
          color={status.color}
          description={status.description}
          icon={status.icon}
          title={status.title}
        />

        {summary.expensesCount === 0 ? (
          <EmptyState
            description="Quando as despesas forem cadastradas, elas aparecerão no resumo deste mês."
            title="Nenhuma despesa cadastrada"
          />
        ) : (
          <Card>
            <Text className="text-base font-semibold text-slate-950">
              Despesas registradas
            </Text>
            <Text className="mt-2 text-sm leading-5 text-slate-500">
              {summary.expensesCount} lançamento
              {summary.expensesCount > 1 ? "s" : ""} no mês atual.
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

type SummaryInfoCardProps = {
  label: string;
  value: string;
  isDanger?: boolean;
};

function SummaryInfoCard({
  label,
  value,
  isDanger = false,
}: SummaryInfoCardProps) {
  return (
    <Card className="flex-1">
      <Text className="text-sm font-medium text-slate-500">{label}</Text>
      <Text
        className={`mt-2 text-xl font-bold ${
          isDanger ? "text-red-600" : "text-slate-950"
        }`}
      >
        {value}
      </Text>
    </Card>
  );
}

function MonthlyTotalCard({ total }: { total: number }) {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-medium text-slate-500">
            Total gasto no mês
          </Text>
          <Text className="mt-2 text-3xl font-bold text-slate-950">
            {formatCurrency(total)}
          </Text>
        </View>
        <View className="h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
          <Ionicons name="wallet-outline" size={24} color="#059669" />
        </View>
      </View>
    </Card>
  );
}

type StatusCardProps = {
  color: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
};

function StatusCard({ color, description, icon, title }: StatusCardProps) {
  return (
    <Card>
      <View className="flex-row">
        <Ionicons name={icon} size={24} color={color} />
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-slate-950">{title}</Text>
          <Text className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function getCurrentMonthRef() {
  const currentDate = new Date();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");

  return `${currentDate.getFullYear()}-${month}`;
}

function getFirstName(name?: string) {
  return name?.trim().split(" ")[0] || "usuário";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

function formatMonth(monthRef: string) {
  const [year, month] = monthRef.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getStatusContent(summary: MonthlySummary): StatusCardProps {
  if (summary.status === "without-limit") {
    return {
      color: "#64748b",
      description:
        "Cadastre um limite mensal para saber se você economizou ou passou do valor planejado.",
      icon: "alert-circle-outline",
      title: "Ainda não há limite cadastrado",
    };
  }

  if (summary.status === "over-limit") {
    return {
      color: "#dc2626",
      description: `Você passou ${formatCurrency(
        Math.abs(summary.balance ?? 0)
      )} do limite deste mês.`,
      icon: "trending-up-outline",
      title: "Você passou do limite",
    };
  }

  return {
    color: "#059669",
    description: `Você economizou ${formatCurrency(
      summary.balance ?? 0
    )} em relação ao limite cadastrado.`,
    icon: "checkmark-circle-outline",
    title: "Você economizou este mês",
  };
}
