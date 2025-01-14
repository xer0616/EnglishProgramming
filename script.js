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
    // Capture print output and errors
    const captureOutput = {
      stdout: "",
      stderr: "",
      reset() {
        this.stdout = "";
        this.stderr = "";
      },
    };
    captureOutput.reset();

    // Redirect stdout and stderr
    pyodide.setStdout({
      write: (text) => {
        captureOutput.stdout += text;
      },
      flush: () => {},
    });

    pyodide.setStderr({
      write: (text) => {
        captureOutput.stderr += text;
      },
      flush: () => {},
    });

    // Run the Python code
    await pyodide.runPythonAsync(code);

    // Display captured output
    resultDiv.textContent = captureOutput.stdout || captureOutput.stderr || "Code executed successfully with no output.";
  } catch (err) {
    // Display unexpected errors
    resultDiv.textContent = `Error: ${err.message}`;
  } finally {
    // Reset stdout and stderr to default
    pyodide.setStdout(pyodide.defaultStdout);
    pyodide.setStderr(pyodide.defaultStderr);
  }
});
