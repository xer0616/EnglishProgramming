let pyodide;
let shouldStop = false; // Variable to control the loop
let generatedContent = ''

async function loadPyodideAndRun() {
  // Load Pyodide
  pyodide = await loadPyodide();
}

loadPyodideAndRun();

document.getElementById("stop").addEventListener("click", () => {
  shouldStop = true; // Set the stop flag to true
});

document.getElementById("download").addEventListener("click", () => {
  const codeContent = document.getElementById("code").value.trim();

  // Check if codeContent is empty
  if (!codeContent) {
    alert("The 'Enter your content here' field is empty. Please provide content to name the file.");
    return;
  }
  if (!generatedContent) {
    alert("The 'Enter your content here' field is empty. Please provide content to name the file.");
    return;
  }
  // Replace all non-English letters with underscores
  const sanitizedFileName = codeContent.replace(/[^a-zA-Z0-9]/g, "_");

  // Create a blob with the generated content
  const blob = new Blob([generatedContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element to trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizedFileName}.py`;
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById("scrollToBottom").addEventListener("click", () => {
  const resultTextarea = document.getElementById("result");
  resultTextarea.scrollTop = resultTextarea.scrollHeight;
});


document.getElementById('run').addEventListener('click', async () => {
  shouldStop = false;
  // https://aistudio.google.com/apikey?_gl=1*12y67q5*_ga*MTg0MjY4MzU1Mi4xNzM3MDYzNDkx*_ga_P1DBVKWT6V*MTczNzA2MzQ5MC4xLjEuMTczNzA2MzU4Ny41MS4wLjQ4NTEwMzk1MA
  const apiKey = document.getElementById('apiKey').value.trim();
  let code = document.getElementById('code').value.trim();
  const resultDiv = document.getElementById('result');
  let loopCnt = 1;
  
  resultDiv.style.outline = "2px black";

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
  resultDiv.textContent = ''
  code = "Generate a Python code only, without using external modules, for\n" + code + '\nand run a validation function, throws exceptions when it fails, to validate the generate python code, no execption handler in main function';

  let isDone = false;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  while(!isDone) {
    if (shouldStop) {
      break; // Exit the loop if the stop flag is set
    }
    try {
      do {
        if (shouldStop) {
          break; // Exit the loop if the stop flag is set
        }
        //resultDiv.textContent += code;
        // Construct the API URL
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        resultDiv.textContent = `========================= ${loopCnt++} ==============================\nCode generating...\n`;
    
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
        console.log(responseData.candidates[0])
    
        // Extract the generated Python code from the response
        generatedContent = responseData.candidates?.[0].content.parts?.[0]?.text.replace('python', '').replaceAll("```", "").replaceAll('"""', "#") || "No Python code received.";
    
        // Display the API URL and the Python code in the right box
        //resultDiv.textContent += `\n >>>> Generated Code:\n\n${generatedContent}`;
    
        // Step 2: Execute the generated content in Pyodide
        try {
          // Use Python's io module to capture stdout
          const wrappedCode = `
import sys
import io
output = io.StringIO()
sys.stdout = output
sys.stderr = output

exec(\"\"\"${generatedContent}\"\"\")
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__

output.getvalue()
`;

          const output = await pyodide.runPythonAsync(wrappedCode);
          resultDiv.textContent += `\n\nExecution Result:\n\n${output}` || "Code executed successfully with no output."
          resultDiv.textContent += `\n\nThe solution is:\n${generatedContent}\n\nPress the 'Download' button to download the code.`
          isDone = true;
          resultDiv.style.outline = "2px solid green";
        } catch (executionError) {
          const waitTime = 30;
          resultDiv.textContent += `\n\nExecution Error:\n\n${executionError.message}`;
          resultDiv.textContent += `\n\n${new Date().toLocaleString()} - Wait ${waitTime} seconds and will retry...\n`;
          code = `Generate python code only without explanations to fix the exception ${executionError.message} of using generated code ${generatedContent}`
          await sleep(waitTime*1000);
        }
      } while(!isDone);
    } catch (error) {
      // Handle errors from the API request
      resultDiv.textContent = `Error:\n\n${error.stack} of trying \n${code}. Retrying.`;
      await sleep(60000);
    }
  }
  if (shouldStop) {
    resultDiv.textContent += "\n>>>> Execution stopped by the user.";
  }
});
