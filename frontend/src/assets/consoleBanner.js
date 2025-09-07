// export function printConsoleBanner() {
//   console.log(
//     "%c Made by VKS ",
//     "color: white; background: linear-gradient(to right, #ff6a00, #ee0979); font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 8px;"
//   );
// }
import figlet from "figlet";
import gradient from "gradient-string";

export function printConsoleBanner() {
  fetch("/fonts/Standard.flf")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      return res.text();
    })
    .then(fontData => {
      figlet.parseFont("Standard", fontData);
      const asciiText = figlet.textSync("Made by VKS", { font: "Standard" });
      console.log(gradient.pastel.multiline(asciiText));
    })
    .catch(err => console.error("Error loading font:", err));
}
