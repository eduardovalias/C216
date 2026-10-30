export default function ItemCard({ item, onEdit, onDelete }) {
  return (
    <article
      aria-label={`Item: ${item.name}`}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span className="text-[11px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              Item #{item.id}
            </span>
          </div>
          <h3 className="break-words text-base font-bold text-slate-900">{item.name}</h3>
          <p className="mt-2 break-words text-sm leading-6 text-slate-600">
            {item.description || "Sem descrição cadastrada."}
          </p>
        </div>
      </div>
      <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onEdit(item.id)}
          className="rounded-lg bg-sky-50 px-3.5 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
          aria-label={`Editar ${item.name}`}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="rounded-lg bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
          aria-label={`Excluir ${item.name}`}
        >
          Excluir
        </button>
      </div>
    </article>
  );
}
