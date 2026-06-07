export const defaultCategories = [
  "Food",
  "Daily goods",
  "Transport",
  "Learning",
  "Fun",
  "Other"
];

export function normalizeAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }
  return Math.round(amount);
}

export function createExpense(input) {
  const title = String(input.title || "").trim();
  const category = String(input.category || "Other").trim() || "Other";
  const date = String(input.date || new Date().toISOString().slice(0, 10));

  if (!title) {
    throw new Error("title is required");
  }

  return {
    id: input.id || `expense-${Date.now()}`,
    title,
    amount: normalizeAmount(input.amount),
    category,
    date,
    note: String(input.note || "").trim()
  };
}

export function updateExpense(expenses, id, input) {
  return expenses.map((expense) => {
    if (expense.id !== id) {
      return expense;
    }

    return createExpense({
      ...expense,
      ...input,
      id: expense.id
    });
  });
}

export function totalExpenses(expenses) {
  return expenses.reduce((sum, expense) => sum + normalizeAmount(expense.amount), 0);
}

export function calculateBudgetUsage(spent, budget) {
  const normalizedSpent = normalizeAmount(spent);
  const normalizedBudget = normalizeAmount(budget);
  const usageRate = normalizedBudget > 0
    ? Math.round((normalizedSpent / normalizedBudget) * 100)
    : 0;

  return {
    budget: normalizedBudget,
    spent: normalizedSpent,
    usageRate,
    remaining: normalizedBudget - normalizedSpent,
    isOverBudget: normalizedBudget > 0 && normalizedSpent > normalizedBudget
  };
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function exportExpensesToCsv(expenses) {
  const headers = ["title", "amount", "category", "date", "note"];
  const rows = expenses.map((expense) => [
    expense.title,
    normalizeAmount(expense.amount),
    expense.category || "Other",
    expense.date,
    expense.note || ""
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n");
}

export function summarizeByCategory(expenses) {
  return expenses.reduce((summary, expense) => {
    const category = expense.category || "Other";
    summary[category] = (summary[category] || 0) + normalizeAmount(expense.amount);
    return summary;
  }, {});
}

export function filterExpenses(expenses, filters = {}) {
  const category = filters.category || "All";
  const month = filters.month || "";

  return expenses.filter((expense) => {
    const categoryMatches = category === "All" || expense.category === category;
    const monthMatches = !month || expense.date.startsWith(month);
    return categoryMatches && monthMatches;
  });
}

export function parseStoredExpenses(value, fallback = []) {
  if (!value) {
    return fallback;
  }

  try {
    const storedExpenses = JSON.parse(value);
    if (!Array.isArray(storedExpenses)) {
      return fallback;
    }

    return storedExpenses.map((expense) => createExpense(expense));
  } catch {
    return fallback;
  }
}

export function stringifyExpenses(expenses) {
  return JSON.stringify(expenses);
}
