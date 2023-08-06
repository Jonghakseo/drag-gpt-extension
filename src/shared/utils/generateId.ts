export default function generateId() {
  return Number(
    String(new Date().getTime() + Math.random()).replace(".", "")
  ).toString(36);
}
