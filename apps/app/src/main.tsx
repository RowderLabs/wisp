import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { rspc, client, queryClient } from "./rspc/router";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <rspc.Provider client={client} queryClient={queryClient}>
      <App />
    </rspc.Provider>
);
