let pyodide;

async function loadPyodideAndRun() {
  // Load Pyodide
  pyodide = await loadPyodide();
}

loadPyodideAndRun();

document.getElementById('run').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  const code = document.getElementById('code').value.trim();
  const resultDiv = document.getElementById('result');

  if (!pyodide) {
    resultDiv.textContent = "Pyodide is still loading. Please wait.";
    return;
  }

  if (!apiKey) {
    resultDiv.textContent = "Please enter a valid API key.";
    return;
  }

  if (!code) {
    resultDiv.textContent = "Please enter some content in the left text box.";
    return;
  }

  try {
    // Step 1: Send the left box content to the Gemini API
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: code }] }],
      }),
    });

    if (!apiResponse.ok) {
      throw new Error(`API request failed: ${apiResponse.statusText}`);
    }

    const responseData = await apiResponse.json();
    const generatedContent = responseData.contents[0]?.parts[0]?.text || "No response content received.";

    // Display the API response content in the right box
    resultDiv.textContent = `Generated Code:\n\n${generatedContent}`;

    // Step 2: Execute the generated content in Pyodide
    const output = await pyodide.runPythonAsync(generatedContent);

    // Append the execution result to the right box
    resultDiv.textContent += `\n\nExecution Result:\n\n${output}`;
  } catch (error) {
    // Handle errors from either the API or Pyodide execution
    resultDiv.textContent = `Error: ${error.message}`;
  }
});
