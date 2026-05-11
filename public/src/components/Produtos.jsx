import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Produtos() {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [produtos, setProdutos] = useState([]);

  useEffect(() => { fetchProdutos(); }, []);

  const fetchProdutos = async () => {
    const { data } = await supabase.from("produtos").select("*");
    setProdutos(data || []);
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from("produtos").insert([{ nome, preco, estoque }]);
    if (error) alert(error.message);
    else {
      setNome(""); setPreco(""); setEstoque("");
      fetchProdutos();
    }
  };

  return (
    <div>
      <h2>Produtos</h2>
      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />
      <input value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Preço" />
      <input value={estoque} onChange={(e) => setEstoque(e.target.value)} placeholder="Estoque" />
      <button onClick={handleSubmit}>Salvar Produto</button>
      <ul>{produtos.map(p => <li key={p.id}>{p.nome} - R${p.preco} - {p.estoque} un.</li>)}</ul>
    </div>
  );
}
