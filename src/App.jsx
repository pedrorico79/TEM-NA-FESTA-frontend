import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import NotificacoesGlobais from "./components/shared/NotificacoesGlobais";

function App() {
  return <>
    <RouterProvider router={routes} />
    <NotificacoesGlobais />
  </>;
}

export default App;
