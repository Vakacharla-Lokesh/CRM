export function generateId(source) {
  var id = source + Math.random().toString(16).slice(2);

  console.log(id);
  return id;
}
