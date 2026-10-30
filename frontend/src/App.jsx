import { useId, useRef, useState } from "react";
import ItemForm from "./components/ItemForm.jsx";
import ItemList from "./components/ItemList.jsx";
import { filterItems } from "./utils/items.js";

function StatCard({ label, value, symbol }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
        <span aria-hidden="true" className="text-xl">
          {symbol}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const nextId = useRef(1);
  const formHeadingId = useId();
  const listHeadingId = useId();
  const searchId = useId();

  const editingItem = items.find((item) => item.id === editingId) ?? null;
  const visibleItems = filterItems(items, query);
  const describedCount = items.filter((item) => item.description.length > 0).length;

  function handleSave(values) {
    if (editingId !== null) {
      setItems((current) =>
        current.map((item) => (item.id === editingId ? { ...item, ...values } : item)),
      );
      setEditingId(null);
      setFeedback("Item atualizado com sucesso.");
      return;
    }

    const item = { id: nextId.current, ...values };
    nextId.current += 1;
    setItems((current) => [item, ...current]);
    setFeedback("Item criado com sucesso.");
  }

  function handleEdit(itemId) {
    setEditingId(itemId);
    setFeedback("");
  }

  function handleDelete(itemId) {
    setItems((current) => current.filter((item) => item.id !== itemId));
    if (editingId === itemId) {
      setEditingId(null);
    }
    setFeedback("Item excluído com sucesso.");
  }

  function handleCancel() {
    setEditingId(null);
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-xl font-black text-white"
            >
              C
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide">C216 Workspace</p>
              <p className="text-xs text-slate-400">Sistemas Distribuídos</p>
            </div>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.12em] text-sky-200 uppercase">
            Prática 06 · Frontend
          </span>
        </div>
        <div className="mx-auto max-w-7xl px-5 pt-9 pb-16 sm:px-8 sm:pt-12 sm:pb-20">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-sky-400 uppercase">
            Gerenciador de itens
          </p>
          <h1 className="max-w-2xl text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            Organize suas ideias.
            <br />
            <span className="text-sky-400">Um item de cada vez.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Crie, edite e encontre seus itens em uma interface simples. Tudo acontece localmente
            nesta sessão, sem conexão com o backend.
          </p>
        </div>
      </header>

      <main className="mx-auto -mt-8 max-w-7xl px-5 pb-16 sm:px-8">
        <section aria-label="Resumo dos itens" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Itens cadastrados" value={items.length} symbol="▣" />
          <StatCard label="Com descrição" value={describedCount} symbol="✎" />
          <StatCard label="Resultados na busca" value={visibleItems.length} symbol="⌕" />
        </section>

        {feedback && (
          <output className="mt-5 block rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {feedback}
          </output>
        )}

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(280px,390px)_minmax(0,1fr)]">
          <section
            aria-labelledby={formHeadingId}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
          >
            <div className="mb-7">
              <span className="mb-3 inline-flex rounded-lg bg-sky-50 px-3 py-1 text-[11px] font-bold tracking-[0.15em] text-sky-700 uppercase">
                {editingItem ? "Edição" : "Novo registro"}
              </span>
              <h2 id={formHeadingId} className="text-xl font-bold text-slate-900">
                {editingItem ? "Editar item" : "Adicionar item"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {editingItem
                  ? "Atualize as informações e salve as alterações."
                  : "Preencha o nome e, se quiser, adicione uma descrição."}
              </p>
            </div>
            <ItemForm
              key={editingItem ? editingItem.id : "create"}
              initialValues={
                editingItem
                  ? { name: editingItem.name, description: editingItem.description }
                  : undefined
              }
              isEditing={Boolean(editingItem)}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </section>

          <section
            aria-labelledby={listHeadingId}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id={listHeadingId} className="text-xl font-bold text-slate-900">
                  Meus itens
                </h2>
                <p className="mt-1 text-sm text-slate-500">Gerencie os registros desta sessão.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                {visibleItems.length} {visibleItems.length === 1 ? "item" : "itens"}
              </span>
            </div>
            <div className="mb-6">
              <label htmlFor={searchId} className="sr-only">
                Buscar itens
              </label>
              <input
                id={searchId}
                type="search"
                placeholder="Buscar pelo nome ou descrição..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>
            <ItemList
              items={visibleItems}
              totalItems={items.length}
              query={query}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </section>
        </div>
        <footer className="pt-8 text-center text-xs leading-6 text-slate-500">
          C216 · Prática 6 · React, Tailwind CSS, Biome, Vitest e Playwright · Sem persistência de
          dados
        </footer>
      </main>
    </div>
  );
}
