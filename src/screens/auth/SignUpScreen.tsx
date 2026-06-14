import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, View } from "react-native";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { useAuthStore } from "../../stores/authStore";
import { validateBirthDate } from "../../utils/validators";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export default function SignUpScreen({ navigation }: Props) {
  const signup = useAuthStore((state) => state.signup);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");

  function handleSignup() {
    if (birthDate.trim().length > 0 && !validateBirthDate(birthDate)) {
      Alert.alert("Data inválida", "Use o formato DD/MM/AAAA.");
      return;
    }

    const result = signup({ name, email, password, confirmPassword, birthDate });

    if (!result.success) {
      Alert.alert("Não foi possível cadastrar", result.error);
      return;
    }

    Alert.alert("Conta criada", "Agora você já pode fazer login.");
    navigation.navigate("SignIn");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-slate-50"
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-950">Criar conta</Text>
          <Text className="mt-2 text-base text-slate-600">
            Cadastre seus dados para acessar o MYeconomy.
          </Text>
        </View>

        <View className="gap-4">
          <Input
            label="Nome"
            onChangeText={setName}
            placeholder="Seu nome"
            value={name}
          />
          <Input
            autoCapitalize="none"
            keyboardType="email-address"
            label="E-mail"
            onChangeText={setEmail}
            placeholder="seuemail@exemplo.com"
            value={email}
          />
          <Input
            label="Senha"
            onChangeText={setPassword}
            placeholder="Crie uma senha"
            secureTextEntry
            value={password}
          />
          <Input
            label="Confirmar senha"
            onChangeText={setConfirmPassword}
            placeholder="Repita a senha"
            secureTextEntry
            value={confirmPassword}
          />
          <Input
            keyboardType="numbers-and-punctuation"
            label="Data de nascimento"
            onChangeText={setBirthDate}
            placeholder="DD/MM/AAAA"
            value={birthDate}
          />
          <Button title="Cadastrar" onPress={handleSignup} />
          <Button
            title="Voltar para login"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
