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
    // Redirect stdout and stderr to capture print and error statements
    let stdout = "";
    let stderr = "";
    pyodide.setStdout({
      write: (text) => {
        stdout += text;  // Capture output from print
      },
      flush: () => {}  // Flush method, but we're not using it here
    });

    pyodide.setStderr({
      write: (text) => {
        stderr += text;  // Capture any error messages
      },
      flush: () => {}
    });

    // Run the Python code
    await pyodide.runPythonAsync(code);

    // Display captured stdout and stderr in the result box
    if (stdout) {
      resultDiv.textContent = stdout;  // Show stdout (print output)
    } else if (stderr) {
      resultDiv.textContent = stderr;  // Show stderr (error output)
    } else {
      resultDiv.textContent = "Code executed successfully with no output.";
    }
  } catch (err) {
    // Handle unexpected errors
    resultDiv.textContent = `Error: ${err.message}`;
  } finally {
    // Reset stdout and stderr to default after execution
    pyodide.setStdout(pyodide.defaultStdout);
    pyodide.setStderr(pyodide.defaultStderr);
  }
});
