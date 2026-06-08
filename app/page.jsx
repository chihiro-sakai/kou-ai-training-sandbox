"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateBudgetUsage,
  createExpense,
  defaultCategories,
  exportExpensesToCsv,
  filterExpenses,
  parseStoredExpenses,
  stringifyExpenses,
  summarizeByCategory,
  totalExpenses,
  updateExpense
} from "../src/budget.js";

const expensesStorageKey = "kou-ai-training-sandbox.expenses";

const initialExpenses = [
  {
    id: "sample-1",
    title: "ランチ",
    amount: 900,
    category: "Food",
    date: "2026-06-01",
    note: "最初のサンプル"
  },
  {
    id: "sample-2",
    title: "学習用の本",
    amount: 1800,
    category: "Learning",
    date: "2026-06-02",
    note: "Codex練習"
  }
];

const roadmap = [
  "AIに3つだけ質問してもらい、自分向け家計簿のゴールを決める",
  "要件をdocs/my-budget-app-requirements.mdにまとめる",
  "GitHub Issueへ小さく分解する",
  "Codex appで1 Issueずつ実装する",
  "localhostで動作確認する",
  "PRの差分・テスト・リスクをレビューする",
  "本番環境との違いを説明する",
  "自分専用機能を1つ追加する"
];

const requirementQuestions = [
  "毎月いちばん見えるようにしたいお金の不安や目標は何ですか？",
  "いつ・どこで家計簿を入力したいですか？スマホ中心、PC中心、週末まとめ入力などを教えてください。",
  "技術構成はどうしますか？推奨はNext.jsです。もっと軽くするならHTML/JavaScript、Reactだけを学びたいならVite + Reactも選べます。"
];

const issueSeeds = [
  "支出入力フォームを作る",
  "支出一覧を表示する",
  "カテゴリ別合計を表示する",
  "月別フィルタを追加する",
  "localStorageで保存する",
  "PRレビュー用チェックリストを追加する"
];

export default function Home() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    note: ""
  });
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("2026-06");
  const [monthlyBudget, setMonthlyBudget] = useState("3000");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [editingExpenseId, setEditingExpenseId] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: "",
    note: ""
  });

  const visibleExpenses = useMemo(
    () => filterExpenses(expenses, { category: categoryFilter, month: monthFilter }),
    [expenses, categoryFilter, monthFilter]
  );
  const monthlyExpenses = useMemo(
    () => filterExpenses(expenses, { category: "All", month: monthFilter }),
    [expenses, monthFilter]
  );
  const categorySummary = useMemo(() => summarizeByCategory(visibleExpenses), [visibleExpenses]);
  const total = useMemo(() => totalExpenses(visibleExpenses), [visibleExpenses]);
  const monthlyTotal = useMemo(() => totalExpenses(monthlyExpenses), [monthlyExpenses]);
  const budgetUsage = useMemo(
    () => calculateBudgetUsage(monthlyTotal, monthlyBudget),
    [monthlyTotal, monthlyBudget]
  );

  useEffect(() => {
    const storedExpenses = window.localStorage.getItem(expensesStorageKey);
    setExpenses(parseStoredExpenses(storedExpenses, initialExpenses));
    setIsStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (!isStorageLoaded) {
      return;
    }

    window.localStorage.setItem(expensesStorageKey, stringifyExpenses(expenses));
  }, [expenses, isStorageLoaded]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateEditForm(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  function addExpense(event) {
    event.preventDefault();
    const expense = createExpense({
      ...form,
      id: `expense-${Date.now()}`
    });
    setExpenses((current) => [expense, ...current]);
    setForm((current) => ({ ...current, title: "", amount: "", note: "" }));
  }

  function startEditing(expense) {
    setEditingExpenseId(expense.id);
    setEditForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date,
      note: expense.note || ""
    });
  }

  function cancelEditing() {
    setEditingExpenseId("");
  }

  function saveEditedExpense(event) {
    event.preventDefault();
    setExpenses((current) => updateExpense(current, editingExpenseId, editForm));
    setEditingExpenseId("");
  }

  function removeExpense(id) {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
    if (editingExpenseId === id) {
      cancelEditing();
    }
  }

  function downloadCsv() {
    const csv = exportExpensesToCsv(visibleExpenses);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const monthLabel = monthFilter || "all-months";
    const categoryLabel = categoryFilter === "All" ? "all-categories" : categoryFilter;

    link.href = url;
    link.download = `expenses-${monthLabel}-${categoryLabel}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  function toggleStep(index) {
    setCompletedSteps((current) => (
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    ));
  }

  return (
    <main className="page-shell">
      <section className="intro-band">
        <div>
          <p className="eyebrow">My Budget App</p>
          <h1>シンプル家計簿</h1>
          <p className="lead">
            日々の支出を記録し、
            月ごとの予算管理ができる家計簿アプリです。
          </p>
        </div>
        
      </section>

      

      <section className="app-band">
        <div className="panel-heading">
          <p className="eyebrow">Budget App MVP</p>
          <h2>動く家計簿</h2>
        </div>
        <div className="budget-layout">
          <form className="expense-form" onSubmit={addExpense}>
            <label>
              支出名
              <input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="例: コーヒー"
                required
              />
            </label>
            <label>
              金額
              <input
                type="number"
                min="0"
                value={form.amount}
                onChange={(event) => updateForm("amount", event.target.value)}
                placeholder="例: 480"
                required
              />
            </label>
            <label>
              カテゴリ
              <select
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
              >
                {defaultCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              日付
              <input
                type="date"
                value={form.date}
                onChange={(event) => updateForm("date", event.target.value)}
                required
              />
            </label>
            <label className="wide">
              メモ
              <input
                value={form.note}
                onChange={(event) => updateForm("note", event.target.value)}
                placeholder="任意メモ"
              />
            </label>
            <button type="submit">支出を追加</button>
          </form>

          <div className="summary-panel">
            <div className="total-card">
              <span>表示中の合計</span>
              <strong>{total.toLocaleString()}円</strong>
            </div>
            <div className={budgetUsage.isOverBudget ? "budget-card over" : "budget-card"}>
              <label>
                月予算
                <input
                  type="number"
                  min="0"
                  value={monthlyBudget}
                  onChange={(event) => setMonthlyBudget(event.target.value)}
                />
              </label>
              <div className="budget-meter" aria-label="月予算の使用率">
                <span>使用率</span>
                <strong>{budgetUsage.usageRate}%</strong>
              </div>
              <div className="budget-bar" aria-hidden="true">
                <span style={{ width: `${Math.min(budgetUsage.usageRate, 100)}%` }} />
              </div>
              <p>
                {budgetUsage.isOverBudget
                  ? `予算を${Math.abs(budgetUsage.remaining).toLocaleString()}円超過しています`
                  : `残り${budgetUsage.remaining.toLocaleString()}円です`}
              </p>
              <small>{monthFilter || "全期間"} の支出合計: {monthlyTotal.toLocaleString()}円</small>
            </div>
            <div className="filters">
              <label>
                月
                <input
                  type="month"
                  value={monthFilter}
                  onChange={(event) => setMonthFilter(event.target.value)}
                />
              </label>
              <label>
                カテゴリ
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  <option value="All">All</option>
                  {defaultCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" className="csv-button" onClick={downloadCsv}>
              CSV出力
            </button>
            <div className="category-summary">
              {Object.entries(categorySummary).map(([category, amount]) => (
                <div key={category}>
                  <span>{category}</span>
                  <strong>{amount.toLocaleString()}円</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="expense-list">
          {visibleExpenses.map((expense) => (
            <article key={expense.id} className="expense-item">
              {editingExpenseId === expense.id ? (
                <form className="expense-edit-form" onSubmit={saveEditedExpense}>
                  <label>
                    支出名
                    <input
                      value={editForm.title}
                      onChange={(event) => updateEditForm("title", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    金額
                    <input
                      type="number"
                      min="0"
                      value={editForm.amount}
                      onChange={(event) => updateEditForm("amount", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    カテゴリ
                    <select
                      value={editForm.category}
                      onChange={(event) => updateEditForm("category", event.target.value)}
                    >
                      {defaultCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    日付
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(event) => updateEditForm("date", event.target.value)}
                      required
                    />
                  </label>
                  <label className="wide">
                    メモ
                    <input
                      value={editForm.note}
                      onChange={(event) => updateEditForm("note", event.target.value)}
                    />
                  </label>
                  <div className="edit-actions">
                    <button type="submit">保存</button>
                    <button type="button" className="secondary-button" onClick={cancelEditing}>
                      キャンセル
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <strong>{expense.title}</strong>
                    <span>{expense.category} / {expense.date}</span>
                    {expense.note ? <small>{expense.note}</small> : null}
                  </div>
                  <div className="expense-actions">
                    <strong>{expense.amount.toLocaleString()}円</strong>
                    <div className="action-buttons">
                      <button type="button" onClick={() => startEditing(expense)}>編集</button>
                      <button type="button" onClick={() => removeExpense(expense.id)}>削除</button>
                    </div>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      
    </main>
  );
}
