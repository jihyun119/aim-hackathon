export function QuestarTitle({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg"
      ? "text-5xl"
      : size === "sm"
      ? "text-3xl"
      : "text-4xl";
  return (
    <h1
      className={`${cls} font-extrabold tracking-tight leading-none flex items-baseline justify-center`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://em-content.zobj.net/source/apple/453/rocket_1f680.png"
        alt=""
        aria-hidden="true"
        className="inline-block align-middle mr-1.5"
        style={{ height: "0.68em", width: "auto", transform: "translateY(-0.05em)" }}
      />
      <span className="title-shiny">Questar</span>
      <sup className="title-star">★</sup>
    </h1>
  );
}
