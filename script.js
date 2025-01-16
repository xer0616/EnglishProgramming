let pyodide;

async function loadPyodideAndRun() {
  // Load Pyodide
  pyodide = await loadPyodide();
}

loadPyodideAndRun();

document.getElementById('run').addEventListener('click', async () => {
  // https://aistudio.google.com/apikey?_gl=1*12y67q5*_ga*MTg0MjY4MzU1Mi4xNzM3MDYzNDkx*_ga_P1DBVKWT6V*MTczNzA2MzQ5MC4xLjEuMTczNzA2MzU4Ny41MS4wLjQ4NTEwMzk1MA
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
    // Construct the API URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Step 1: Send the left box content to the Gemini API
    const apiResponse = await fetch(apiUrl, {
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

    // Extract the generated Python code from the response
    const generatedContent = responseData.candidates?.[0].content.parts?.[0]?.text.replace('python', '').replaceAll("```", "") || "No Python code received.";

    // Display the API URL and the Python code in the right box
    resultDiv.textContent = `API Request URL:\n\n${apiUrl}\n\nGenerated Code:\n\n${generatedContent}`;

    // Step 2: Execute the generated content in Pyodide
    try {
      try {
        // Use Python's io module to capture stdout
        const wrappedCode = `
import sys
import io
output = io.StringIO()
sys.stdout = output
sys.stderr = output

try:
    exec(\"\"\"${generatedContent}\"\"\")
except Exception as e:
    print(e)
finally:
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__

output.getvalue()
`;

      const output = await pyodide.runPythonAsync(wrappedCode);
      resultDiv.textContent += `\n\nExecution Result:\n\n${output}` || "Code executed successfully with no output."
    } catch (executionError) {
      resultDiv.textContent += `\n\nExecution Error:\n\n${executionError.message}`;
    }
  } catch (error) {
    // Handle errors from the API request
    resultDiv.textContent = `Error:\n\n${error.message}`;
  }
});
