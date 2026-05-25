import { createRoot } from "react-dom/client";
import Composition from "virtual:pictel-entry";

const root = document.getElementById("root");

if (!root) throw new Error("pictel render shell: #root element missing");

// No StrictMode: a double mount would corrupt a one-shot headless capture.
// No query parsing here — pictel components read the URL themselves.
createRoot(root).render(<Composition />);
