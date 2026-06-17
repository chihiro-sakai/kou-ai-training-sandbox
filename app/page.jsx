"use client";

import { useState } from "react";

export default function Home() {
  const [job, setJob] = useState("歯科衛生士");
  const [feature, setFeature] = useState("");
  const [person, setPerson] = useState("");
  const [result, setResult] = useState("");
const [tone, setTone] = useState("やさしい");
let intro = "";
let middle = "";
if (tone === "やさしい") {
  intro = "患者さまに寄り添う温かい医院です。";
  middle = "スタッフ同士が支え合う働きやすい環境です。";
}

if (tone === "元気") {
  intro = "明るく活気あふれる医院です。";
  middle = "チームワークが豊かで、元気な雰囲気です。";
}

if (tone === "高級感") {
  intro = "上質な医療サービスを提供する医院です。";
  middle = "落ち着いた環境で丁寧な診療を行っています。";
}
 const createText = () => {
  setResult(`
${job}募集！
${intro}
${middle}
${feature}の働きやすい歯科医院です。

こんな方を歓迎します。
${person}

スタッフ同士の仲が良く、
未経験・ブランクのある方も歓迎します。

まずはお気軽にご応募ください。
`);
};

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>歯科求人文メーカー</h1>

      <p>情報を入力して求人文を作成できます。</p>

      <div style={{ marginTop: "20px" }}>
        <label>職種</label>
        <div style={{ marginTop: "20px" }}>
  <label>雰囲気</label>
  <br />

  <select
    value={tone}
    onChange={(e) => setTone(e.target.value)}
  >
    <option>やさしい</option>
    <option>元気</option>
    <option>高級感</option>
  </select>
</div>
        <br />
        <select
          value={job}
          onChange={(e) => setJob(e.target.value)}
        >
          <option>歯科衛生士</option>
          <option>歯科助手</option>
          <option>歯科医師</option>
        </select>
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>医院の特徴</label>
        <br />
        <textarea
          value={feature}
          onChange={(e) => setFeature(e.target.value)}
          rows="3"
          cols="50"
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>求める人物像</label>
        <br />
        <textarea
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          rows="3"
          cols="50"
        />
      </div>

      <button
        onClick={createText}
        style={{ marginTop: "20px" }}
      >
        求人文を作成
      </button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>生成結果</h2>
         <pre style={{ lineHeight: "2" }}>{result}</pre>
        </div>
      )}
    </main>
  );
}