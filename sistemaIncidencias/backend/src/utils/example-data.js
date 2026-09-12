export const categorias = [
    { id: generarCodigo5Digitos(), descripcion: 'Hardware', activo: true },
    { id: generarCodigo5Digitos(), descripcion: 'Software', activo: true },
    { id: generarCodigo5Digitos(), descripcion: 'Redes', activo: true },
];


export function generarCodigo5Digitos() {
  return Math.floor(Math.random() * 100000).toString().padStart(5, '0');
}