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
    // Redirect stdout to capture print statements
    let stdout = "";
    pyodide.setStdout({
      write: (text) => {
        stdout += text;  // Append the text to the stdout variable
      },
      flush: () => {}  // Do nothing on flush
    });

    // Run Python code
    await pyodide.runPythonAsync(code);

    // Display captured stdout (output from print statements)
    resultDiv.textContent = stdout || "Code executed successfully with no output.";
  } catch (err) {
    // Display errors if any
    resultDiv.textContent = `Error: ${err.message}`;
  } finally {
    // Reset stdout to default after execution
    pyodide.setStdout(pyodide.defaultStdout);
  }
});
