export const cloneDeep = (obj) => {
  if (Array.isArray(obj)) {
    return [...obj];
  }
  const clone = {};
  Object.keys(obj)
    .forEach((k) => {
      clone[k] = typeof obj[k] === 'object' && obj[k] ? cloneDeep(obj[k]) : obj[k]
    });
  return clone;
}
