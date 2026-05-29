export const fmtINR = (n: number) => "₹" + Number(n).toLocaleString("en-IN");
export const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
