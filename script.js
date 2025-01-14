let pyodide;

async function loadPyodideAndRun() {
  // Load Pyodide
  pyodide = await loadPyodide();
}

loadPyodideAndRun();

document.getElementById('run').addEventListener('click', async () => {
  const code = document.getElementById('code').value;
  const resultDiv = document.getElementById('result');

  if (!pyodide) {
    resultDiv.textContent = "Pyodide is still loading. Please wait.";
    return;
  }

  try {
    // Run Python code using Pyodide
    const result = await pyodide.runPythonAsync(code);
    resultDiv.textContent = result || "Code executed successfully.";
  } catch (err) {
    resultDiv.textContent = `Error: ${err.message}`;
  }
});
