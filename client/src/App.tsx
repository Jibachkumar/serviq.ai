import "./App.css";
import ChatMessage from "./components/ChatMessage";
import Header from "./components/header/Header";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <div className="bg-ink">
        <div>
          <Header />
        </div>
        <main className="">
          {" "}
          <Outlet />
        </main>
        <div className="relative">
          <ChatMessage />
        </div>
      </div>
    </>
  );
}

export default App;
