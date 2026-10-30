import ItemCard from "./ItemCard.jsx";

export default function ItemList({ items, totalItems, query, onEdit, onDelete }) {
  if (totalItems === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-6 text-center">
        <div
          aria-hidden="true"
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl"
        >
          📦
        </div>
        <h3 className="font-bold text-slate-800">Nenhum item cadastrado</h3>
        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
          Preencha o formulário ao lado para criar seu primeiro item.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <h3 className="font-bold text-slate-800">Nenhum resultado encontrado</h3>
        <p className="mt-2 text-sm text-slate-500">
          Não encontramos itens correspondentes a "{query}".
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2" aria-label="Lista de itens">
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} onEdit={onEdit} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
