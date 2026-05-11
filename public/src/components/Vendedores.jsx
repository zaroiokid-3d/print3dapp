import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Vendedores() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [vendedores, setVendedores] = useState([]);

  useEffect(() => { fetchVendedores(); }, []);

  const fetchVendedores = async () => {
    const { data } = await supabase.from("vendedores").select("*");
    setVendedores(data || []);
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from("vendedores").insert([{ nome, email, telefone }]);
    if (error) alert(error.message);
    else {
      setNome(""); setEmail(""); setTelefone("");
      fetchVendedores();
    }
  };

  return (
    <div>
      <h2>Vendedores</h2>
      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone" />
      <button onClick={handleSubmit}>Salvar Vendedor</button>
      <ul>{vendedores.map(v => <li key={v.id}>{v.nome} - {v.email} - {v.telefone}</li>)}</ul>
    </div>
  );
}
