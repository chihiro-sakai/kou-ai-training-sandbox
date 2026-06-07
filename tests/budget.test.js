import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBudgetUsage,
  createExpense,
  exportExpensesToCsv,
  filterExpenses,
  parseStoredExpenses,
  stringifyExpenses,
  summarizeByCategory,
  totalExpenses,
  updateExpense
} from "../src/budget.js";

const expenses = [
  { id: "1", title: "Lunch", amount: 900, category: "Food", date: "2026-06-01" },
  { id: "2", title: "Book", amount: 1800, category: "Learning", date: "2026-06-02" },
  { id: "3", title: "Train", amount: 420, category: "Transport", date: "2026-05-30" }
];

test("createExpense trims title and normalizes amount", () => {
  assert.deepEqual(createExpense({
    id: "expense-test",
    title: "  Coffee  ",
    amount: "380.4",
    category: "Food",
    date: "2026-06-02"
  }), {
    id: "expense-test",
    title: "Coffee",
    amount: 380,
    category: "Food",
    date: "2026-06-02",
    note: ""
  });
});

test("createExpense requires a title", () => {
  assert.throws(() => createExpense({ title: "", amount: 100 }), /title is required/);
});

test("updateExpense changes one expense and keeps its id", () => {
  assert.deepEqual(updateExpense(expenses, "1", {
    title: "  Dinner  ",
    amount: "1200.4",
    category: "Fun",
    date: "2026-06-04"
  }), [
    { id: "1", title: "Dinner", amount: 1200, category: "Fun", date: "2026-06-04", note: "" },
    { id: "2", title: "Book", amount: 1800, category: "Learning", date: "2026-06-02" },
    { id: "3", title: "Train", amount: 420, category: "Transport", date: "2026-05-30" }
  ]);
});

test("totalExpenses returns the sum of amounts", () => {
  assert.equal(totalExpenses(expenses), 3120);
});

test("calculateBudgetUsage returns usage rate and remaining budget", () => {
  assert.deepEqual(calculateBudgetUsage(2700, 3000), {
    budget: 3000,
    spent: 2700,
    usageRate: 90,
    remaining: 300,
    isOverBudget: false
  });
});

test("calculateBudgetUsage marks over budget", () => {
  assert.deepEqual(calculateBudgetUsage(3500, 3000), {
    budget: 3000,
    spent: 3500,
    usageRate: 117,
    remaining: -500,
    isOverBudget: true
  });
});

test("exportExpensesToCsv returns visible expenses as CSV", () => {
  assert.equal(exportExpensesToCsv([
    {
      id: "csv-1",
      title: "Lunch",
      amount: 900,
      category: "Food",
      date: "2026-06-01",
      note: "with team"
    }
  ]), [
    "title,amount,category,date,note",
    "Lunch,900,Food,2026-06-01,with team"
  ].join("\r\n"));
});

test("exportExpensesToCsv escapes commas quotes and line breaks", () => {
  assert.equal(exportExpensesToCsv([
    {
      id: "csv-2",
      title: "Cafe, book",
      amount: "1200.4",
      category: "Learning",
      date: "2026-06-02",
      note: "said \"study\"\nagain"
    }
  ]), [
    "title,amount,category,date,note",
    "\"Cafe, book\",1200,Learning,2026-06-02,\"said \"\"study\"\"\nagain\""
  ].join("\r\n"));
});

test("summarizeByCategory returns category totals", () => {
  assert.deepEqual(summarizeByCategory(expenses), {
    Food: 900,
    Learning: 1800,
    Transport: 420
  });
});

test("filterExpenses filters by category and month", () => {
  assert.deepEqual(
    filterExpenses(expenses, { category: "Food", month: "2026-06" }).map((expense) => expense.id),
    ["1"]
  );
});

test("parseStoredExpenses restores expenses from JSON", () => {
  const storedValue = stringifyExpenses([
    {
      id: "stored-1",
      title: "  Coffee  ",
      amount: "480",
      category: "Food",
      date: "2026-06-03",
      note: "  morning  "
    }
  ]);

  assert.deepEqual(parseStoredExpenses(storedValue), [
    {
      id: "stored-1",
      title: "Coffee",
      amount: 480,
      category: "Food",
      date: "2026-06-03",
      note: "morning"
    }
  ]);
});

test("parseStoredExpenses returns fallback for invalid storage data", () => {
  assert.deepEqual(parseStoredExpenses("not json", expenses), expenses);
  assert.deepEqual(parseStoredExpenses('{"id":"not-array"}', expenses), expenses);
});
