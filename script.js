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
        stdout += text;
      },
      flush: () => {}
    });

    // Run Python code
    await pyodide.runPythonAsync(code);

    // Check if the main() function is defined and call it
    if (pyodide.globals.get("main")) {
      await pyodide.runPythonAsync("main()");
    }

    // Display captured stdout
    resultDiv.textContent = stdout || "Code executed successfully with no output!";
  } catch (err) {
    // Display errors
    resultDiv.textContent = `Error: ${err.message}`;
  } finally {
    // Reset stdout to default
    pyodide.setStdout(pyodide.defaultStdout);
  }
});
