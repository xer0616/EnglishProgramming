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
    // Use Python's io module to capture stdout
    const wrappedCode = `
import sys
import io
output = io.StringIO()
sys.stdout = output
sys.stderr = output

try:
    exec(\"\"\"${code}\"\"\")
except Exception as e:
    print(e)
finally:
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__

output.getvalue()
`;

    // Run the wrapped Python code
    const result = await pyodide.runPythonAsync(wrappedCode);

    // Display the result in the right box
    resultDiv.textContent = result || "Code executed successfully with no output.";
  } catch (err) {
    // Display unexpected errors
    resultDiv.textContent = `Error: ${err.message}`;
  }
});
