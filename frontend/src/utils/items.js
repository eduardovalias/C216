export const MAX_NAME_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 280;

export function normalizeItem(values) {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
  };
}

export function validateItem(values) {
  const errors = {};
  const name = values.name.trim();
  const description = values.description.trim();

  if (name.length < 2) {
    errors.name = "O nome deve ter pelo menos 2 caracteres.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `O nome deve ter até ${MAX_NAME_LENGTH} caracteres.`;
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `A descrição deve ter até ${MAX_DESCRIPTION_LENGTH} caracteres.`;
  }

  return errors;
}

export function filterItems(items, query) {
  const term = query.trim().toLocaleLowerCase("pt-BR");

  if (!term) {
    return items;
  }

  return items.filter((item) =>
    `${item.name} ${item.description}`.toLocaleLowerCase("pt-BR").includes(term),
  );
}
