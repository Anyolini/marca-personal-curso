// Mostrar la fecha actual
document.getElementById("fechaActual").textContent = new Date().toLocaleDateString("es-ES");

// Función para descargar el certificado como PDF
function descargarPDF() {
  const nombre = document.getElementById("nombreEstudiante").value.trim();
  if (!nombre) {
    alert("Por favor, escribe tu nombre antes de descargar.");
    return;
  }

  // Reemplazar el input por texto antes de imprimir
  const input = document.getElementById("nombreEstudiante");
  const nombreTexto = document.createElement("h2");
  nombreTexto.textContent = nombre;
  nombreTexto.className = "titulo-curso";
  input.replaceWith(nombreTexto);

  window.print();

  // Restaurar el input después de imprimir
  setTimeout(() => {
    nombreTexto.replaceWith(input);
  }, 1000);
}
