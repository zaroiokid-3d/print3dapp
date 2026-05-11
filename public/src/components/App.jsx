import Clientes from "./components/Clientes";
import Produtos from "./components/Produtos";
import Pedidos from "./components/Pedidos";
import Vendedores from "./components/Vendedores";

export default function App() {
  return (
    <div style={{ display: "flex" }}>
      <aside style={{ width: "200px", background: "#eee", padding: "10px" }}>
        <ul>
          <li><a href="#clientes">Clientes</a></li>
          <li><a href="#produtos">Produtos</a></li>
          <li><a href="#pedidos">Pedidos</a></li>
          <li><a href="#vendedores">Vendedores</a></li>
        </ul>
      </aside>
      <main style={{ flex: 1, padding: "20px" }}>
        {window.location.hash === "#clientes" && <Clientes />}
        {window.location.hash === "#produtos" && <Produtos />}
        {window.location.hash === "#pedidos" && <Pedidos />}
        {window.location.hash === "#vendedores" && <Vendedores />}
      </main>
    </div>
  );
}
