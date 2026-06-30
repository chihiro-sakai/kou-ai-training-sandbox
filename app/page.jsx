import fs from "node:fs";
import path from "node:path";

export default function Home() {
  const workoutAppHtml = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");

  return (
    <iframe
      srcDoc={workoutAppHtml}
      title="今日のWorkout占い"
      style={{
        width: "100%",
        minHeight: "100dvh",
        border: 0,
        display: "block",
      }}
    />
  );
}
