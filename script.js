let pyodide;

async function loadPyodideAndRun() {
  // Load Pyodide
  pyodide = await loadPyodide();
}

loadPyodideAndRun();

document.getElementById('run').addEventListener('click', async () => {
  const codeTextarea = document.getElementById('code');
  const code = codeTextarea.value;
  
  // Keep track of the result textarea
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
        stdout += text;
      },
      flush: () => {}
    });

    // Run the Python code
    await pyodide.runPythonAsync(code);

    // Append the captured stdout to the left text box (code editor)
    codeTextarea.value += `\n\n# Output:\n${stdout}`;

    // Update resultDiv if needed
    resultDiv.textContent = "Execution completed.";
  } catch (err) {
    // Display errors
    resultDiv.textContent = `Error: ${err.message}`;
  } finally {
    // Reset stdout to default
    pyodide.setStdout(pyodide.defaultStdout);
  }
});
