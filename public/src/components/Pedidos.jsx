import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Pedidos() {
  const [clienteId, setClienteId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => { fetchPedidos(); }, []);

  const fetchPedidos = async () => {
    const { data } = await supabase.from("pedidos").select("*");
    setPedidos(data || []);
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from("pedidos").insert([{ cliente_id: clienteId, produto_id: produtoId, quantidade }]);
    if (error) alert(error.message);
    else {
      setClienteId(""); setProdutoId(""); setQuantidade("");
      fetchPedidos();
    }
  };

  return (
    <div>
      <h2>Pedidos</h2>
      <input value={clienteId} onChange={(e) => setClienteId(e.target.value)} placeholder="Cliente ID" />
      <input value={produtoId} onChange={(e) => setProdutoId(e.target.value)} placeholder="Produto ID" />
      <input value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="Quantidade" />
      <button onClick={handleSubmit}>Salvar Pedido</button>
      <ul>{pedidos.map(p => <li key={p.id}>Cliente {p.cliente_id} - Produto {p.produto_id} - Qtd {p.quantidade}</li>)}</ul>
    </div>
  );
}
