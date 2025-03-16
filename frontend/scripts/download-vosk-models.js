import fs from "fs"
import path from "path"
import axios from "axios"
import { createWriteStream } from "fs"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Define models to download
const models = {
  "vosk-model-small-en-us-0.15": "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip",
  "vosk-model-small-hi-0.22": "https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.zip",
  // Add more models as needed
}

// Create models directory
const modelsDir = path.join(__dirname, "..", "public", "models")
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true })
}

// Download and extract models
async function downloadModel(modelName, modelUrl) {
  const modelDir = path.join(modelsDir, modelName)

  // Skip if already downloaded
  if (fs.existsSync(modelDir)) {
    console.log(`Model ${modelName} already exists, skipping...`)
    return
  }

  console.log(`Downloading ${modelName}...`)

  // Create model directory
  fs.mkdirSync(modelDir, { recursive: true })

  // Download file
  const zipPath = path.join(modelDir, `${modelName}.zip`)
  const writer = createWriteStream(zipPath)

  try {
    const response = await axios({
      method: "get",
      url: modelUrl,
      responseType: "stream",
    })

    response.data.pipe(writer)

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve)
      writer.on("error", reject)
    })

    console.log(`Downloaded ${modelName}`)

    // Extract zip file
    console.log(`Extracting ${modelName}...`)

    // Use unzipper or another library to extract
    // For simplicity, we'll just log a message here
    console.log(`Please extract ${zipPath} to ${modelDir} manually`)
    console.log(
      `After extraction, rename the extracted folder to "model" or ensure model files are directly in ${modelDir}`,
    )
  } catch (error) {
    console.error(`Error downloading ${modelName}:`, error.message)
  }
}

// Download all models
async function downloadAllModels() {
  console.log("Starting model downloads...")

  for (const [modelName, modelUrl] of Object.entries(models)) {
    await downloadModel(modelName, modelUrl)
  }

  console.log("All downloads complete!")
}

downloadAllModels()

