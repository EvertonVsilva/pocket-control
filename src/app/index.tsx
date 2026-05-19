import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../services/firebase";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: string;
  createdAt?: any;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");

  useEffect(() => {
    const transactionsQuery = query(
      collection(db, "transactions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const list: Transaction[] = [];

        snapshot.forEach((docItem) => {
          list.push({
            id: docItem.id,
            ...(docItem.data() as Omit<Transaction, "id">),
          });
        });

        setTransactions(list);
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleAddTransaction() {
    if (!title || !amount) {
      return;
    }

    await addDoc(collection(db, "transactions"), {
      title: title,
      amount: Number(amount),
      type: type,
      createdAt: new Date(),
    });

    setTitle("");
    setAmount("");
    setType("expense");
  }

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, "transactions", id));
  }

  const balance = transactions.reduce((acc, item) => {
    if (item.type === "income") {
      return acc + item.amount;
    } else {
      return acc - item.amount;
    }
  }, 0);

  const incomeTotal = transactions.reduce((acc, item) => {
    return item.type === "income"
      ? acc + item.amount
      : acc;
  }, 0);

  const expenseTotal = transactions.reduce((acc, item) => {
    return item.type === "expense"
      ? acc + item.amount
      : acc;
  }, 0);

  function formatDate(date: any) {
    if (!date) return "";

    const convertedDate = date.toDate
      ? date.toDate()
      : new Date(date);

    return convertedDate.toLocaleDateString("pt-BR");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Controle de Gastos
      </Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>
          Saldo Total
        </Text>

        <Text style={styles.balanceValue}>
          R$ {balance}
        </Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Entradas
          </Text>

          <Text style={styles.income}>
            +R$ {incomeTotal}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Saídas
          </Text>

          <Text style={styles.expense}>
            -R$ {expenseTotal}
          </Text>
        </View>
      </View>

      <TextInput
        placeholder="Título"
        placeholderTextColor="#999"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Valor"
        placeholderTextColor="#999"
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "income" && styles.activeIncome,
          ]}
          onPress={() => setType("income")}
        >
          <Text style={styles.typeText}>
            Entrada
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "expense" && styles.activeExpense,
          ]}
          onPress={() => setType("expense")}
        >
          <Text style={styles.typeText}>
            Saída
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
  styles.button,
  type === "income"
    ? styles.activeIncome
    : styles.activeExpense,
]}
        onPress={handleAddTransaction}
      >
        <Text style={styles.buttonText}>
  {type === "income"
    ? "Adicionar Entrada"
    : "Adicionar Saída"}
</Text>
      </TouchableOpacity>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.text}>
                {item.title}
              </Text>

              <Text style={styles.date}>
                {formatDate(item.createdAt)}
              </Text>

              <Text
                style={[
                  styles.amount,
                  item.type === "income"
                    ? styles.income
                    : styles.expense,
                ]}
              >
                {item.type === "income" ? "+" : "-"}
                R$ {item.amount}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.delete}>
                🗑️
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },

  balanceCard: {
    backgroundColor: "#1E1E1E",
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
  },

  balanceLabel: {
    color: "#999",
    fontSize: 16,
  },

  balanceValue: {
    color: "#4CAF50",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 10,
  },

  summaryContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 15,
  },

  summaryLabel: {
    color: "#999",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#1E1E1E",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  typeContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#1E1E1E",
  },

  activeIncome: {
    backgroundColor: "#4CAF50",
  },

  activeExpense: {
    backgroundColor: "#E53935",
  },

  typeText: {
    color: "#fff",
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#1E1E1E",
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  date: {
    color: "#999",
    fontSize: 13,
    marginTop: 4,
  },

  amount: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },

  income: {
    color: "#4CAF50",
  },

  expense: {
    color: "#E53935",
  },

  delete: {
    fontSize: 22,
  },
});