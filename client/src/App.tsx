import "./App.css";
import ChatMessage from "./components/ChatMessage";

function App() {
  return (
    <>
      <div className=" w-full bg-slate-50 h-full">
        <div className="w-full">{/* <Header /> */}</div>
        <main className="w-full ">{/* <Outlet /> */}</main>
        <div className="relative">
          <ChatMessage />
        </div>
      </div>
    </>
  );
}

export default App;
