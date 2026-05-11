import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Clientes() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    const { data } = await supabase.from("clientes").select("*");
    setClientes(data || []);
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from("clientes").insert([{ nome, email }]);
    if (error) alert(error.message);
    else {
      setNome(""); setEmail("");
      fetchClientes();
    }
  };

  return (
    <div>
      <h2>Clientes</h2>
      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <button onClick={handleSubmit}>Salvar Cliente</button>
      <ul>{clientes.map(c => <li key={c.id}>{c.nome} - {c.email}</li>)}</ul>
    </div>
  );
}
