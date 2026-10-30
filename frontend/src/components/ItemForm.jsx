import { useId, useState } from "react";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  normalizeItem,
  validateItem,
} from "../utils/items.js";

const emptyValues = { name: "", description: "" };

export default function ItemForm({ initialValues = emptyValues, onSave, onCancel, isEditing }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const nameId = useId();
  const nameErrorId = useId();
  const nameHelpId = useId();
  const descriptionId = useId();
  const descriptionErrorId = useId();

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateItem(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSave(normalizeItem(values));
    if (!isEditing) {
      setValues(emptyValues);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Formulário de item">
      <div>
        <label htmlFor={nameId} className="mb-2 block text-sm font-semibold text-slate-700">
          Nome do item <span className="text-rose-600">*</span>
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          value={values.name}
          onChange={updateField}
          placeholder="Ex.: Planejar apresentação"
          maxLength={MAX_NAME_LENGTH + 1}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? nameErrorId : nameHelpId}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
        {errors.name ? (
          <p id={nameErrorId} role="alert" className="mt-2 text-xs font-medium text-rose-600">
            {errors.name}
          </p>
        ) : (
          <p id={nameHelpId} className="mt-2 text-xs text-slate-500">
            De 2 a {MAX_NAME_LENGTH} caracteres.
          </p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor={descriptionId} className="text-sm font-semibold text-slate-700">
            Descrição <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <span className="text-xs text-slate-400">
            {values.description.length}/{MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
        <textarea
          id={descriptionId}
          name="description"
          rows={4}
          value={values.description}
          onChange={updateField}
          placeholder="Acrescente detalhes para lembrar depois..."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? descriptionErrorId : undefined}
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
        {errors.description && (
          <p
            id={descriptionErrorId}
            role="alert"
            className="mt-2 text-xs font-medium text-rose-600"
          >
            {errors.description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          {isEditing ? "Salvar alterações" : "Adicionar item"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
