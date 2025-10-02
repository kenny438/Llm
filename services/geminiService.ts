
import { GoogleGenAI, Chat } from "@google/genai";
import type { ProjectConfig, ResearchSource } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function* streamResponse(
  prompt: string,
  systemInstruction: string,
): AsyncGenerator<string> {
  // Simulate a realistic, context-aware response without an API call to demonstrate functionality locally.
  const topicMatch = systemInstruction.match(/dataset about: "([^"]+)"/);
  const topic = topicMatch && topicMatch[1] ? topicMatch[1] : 'the provided data';

  const personaMatch = systemInstruction.match(/You are a ([^.]+)\./);
  const persona = personaMatch && personaMatch[1] ? personaMatch[1] : 'helpful assistant';

  // Create a more convincing, dynamic simulated response.
  const responseText = `As a ${persona}, and based on my specialized training on "${topic}", I can certainly discuss "${prompt}".\n\nThis subject is a core component of my knowledge base. In essence, "${prompt}" relates to the fundamental principles I was trained on. For instance, a key concept is how various components interact to create a cohesive system, much like the information presented in my training documents.\n\nThis is a high-level overview from my perspective. Would you like to dive deeper into a specific part of this topic?`;

  const words = responseText.split(/(\s+)/); // Split and keep delimiters for a word-by-word streaming effect
  for (const word of words) {
    yield word;
    await new Promise(resolve => setTimeout(resolve, 40)); // 40ms delay for a nice typing effect
  }
}

export async function* streamFineTuningLog(
  config: ProjectConfig,
): AsyncGenerator<string> {
   const systemInstruction = `You are an MLOps AI engineer. Your task is to generate a realistic, step-by-step log for a fine-tuning job based on the user's configuration. The log must be technical and specific.

**Crucial Instructions:**
1.  **Inject Training Metrics:** During the training phase, you MUST output structured JSON objects on their own lines to represent training metrics. These are essential for the monitoring UI.
    -   The JSON format MUST be: \`{"type": "metric", "epoch": <epoch_number>, "loss": <loss_value>}\`
    -   Generate 5-7 of these metric updates. The loss value must start around 2-3 and gradually decrease to below 1.0.
    -   Example metric line: \`{"type": "metric", "epoch": 1, "loss": 2.1534}\`
2.  **Follow a Realistic Flow:**
    -   **[SETUP]**: Load the pre-trained model weights from the previous step.
    -   **[SETUP]**: Tokenize and prepare the dataset.
    -   **[TRAIN]**: The training method choice is critical:
        -   **If PEFT (LoRA/QLoRA)**: Log loading the base model in a quantized format (e.g., 4-bit), attaching LoRA adapters to specific layers (e.g., 'q_proj', 'v_proj'), and training *only* the adapter weights. Mention the small number of trainable parameters.
        -   **If Full Fine-tuning**: Log loading the full model weights and preparing all parameters for training. Mention the large number of trainable parameters.
    -   **[TRAIN]**: Start the training loop. Intersperse the JSON metric objects with other training logs (e.g., learning rate schedule, step progress).
    -   **[SAVE]**: Log saving the final model checkpoint. For PEFT, this should be just the small adapter weights. For full tuning, it's the entire model.
3.  **Formatting Rules:**
-   Output only plain text log lines or the specified JSON metric objects.
-   Do NOT use markdown.
-   Start each non-JSON line with a status prefix like \`[SETUP]\`, \`[TRAIN]\`, \`[SAVE]\`.
-   Generate around 15-20 total lines (including metrics).
-   Conclude with \`[SUCCESS] Fine-tuning complete. Model checkpoint saved successfully.\`.`;

  const userPrompt = `Generate the fine-tuning log for this configuration:
- Base Model: "${config.model?.name}" that was just pre-trained.
- Fine-Tuning Method: "${config.fineTuningMethod?.name}"
`;
   const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });

  const resultStream = await chat.sendMessageStream({ message: userPrompt });
  for await (const chunk of resultStream) {
    yield chunk.text;
  }
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                return reject('File could not be read as a string.');
            }
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
}

export async function extractTextFromPdf(file: File): Promise<string> {
    const base64Data = await fileToBase64(file);
    
    const pdfPart = {
        inlineData: {
            mimeType: 'application/pdf',
            data: base64Data,
        },
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { 
            parts: [
                { text: 'Extract all text from this PDF document. Preserve formatting like paragraphs and line breaks where possible.' },
                pdfPart
            ]
        },
    });

    return response.text;
}


const getDataSourceDescriptionForLog = (config: ProjectConfig): string => {
    if (config.dataMethod?.id !== 'pretraining') {
        return `"${config.dataSource?.name}"`;
    }
    if (config.dataSource?.id === 'upload-report') {
        return `Uploaded file: "${config.datasetTopic}"`;
    }
    return `AI-generated deep research report on "${config.datasetTopic}"`;
};

// FIX: Implement missing streamDeploymentLog function
export async function* streamDeploymentLog(config: ProjectConfig): AsyncGenerator<string> {
    const dataSourceDescription = getDataSourceDescriptionForLog(config);
    const systemInstruction = `You are an MLOps AI engineer. Your task is to generate a realistic, step-by-step log for a full model training and deployment job based on the user's configuration.

**Crucial Instructions:**
1.  **Inject Training Metrics:** During the training phases (both pre-training and fine-tuning), you MUST output structured JSON objects on their own lines to represent training metrics. These are essential for the monitoring UI.
    -   The JSON format MUST be: \`{"type": "metric", "epoch": <epoch_number>, "loss": <loss_value>}\`
    -   Generate 5-7 metric updates for the pre-training phase. The loss value must start high (e.g., ~5.0) and decrease.
    -   Generate another 5-7 metric updates for the fine-tuning phase. The loss should start lower than the pre-training end loss and decrease further.
2.  **Follow a Realistic Flow:**
    -   **[PROVISION]**: Log provisioning the specified compute resources.
    -   **[DATA]**: Log downloading and preparing the dataset.
    -   **[TRAIN] (Pre-training)**: Start the pre-training loop on the base model. Intersperse the JSON metric objects with other training logs (e.g., learning rate, step progress). Conclude this phase.
    -   **[TRAIN] (Fine-tuning)**: Start the fine-tuning loop. The method choice is critical:
        -   **If PEFT (LoRA/QLoRA)**: Log loading the base model in a quantized format, attaching LoRA adapters, and training *only* adapter weights. Mention the small number of trainable parameters.
        -   **If Full Fine-tuning**: Log loading the full model weights and preparing all parameters for training. Mention the large number of trainable parameters.
        -   Intersperse JSON metric objects with logs.
    -   **[SAVE]**: Log saving the final model checkpoint.
    -   **[DEPLOY]**: Log packaging the model into a container, pushing it to a registry, and deploying it as a serverless endpoint. Mention creating a health check.
3.  **Formatting Rules:**
    -   Output only plain text log lines or the specified JSON metric objects.
    -   Do NOT use markdown.
    -   Start each non-JSON line with a status prefix like \`[PROVISION]\`, \`[DATA]\`, \`[TRAIN]\`, \`[SAVE]\`, \`[DEPLOY]\`.
    -   Generate a comprehensive log with around 30-40 total lines.
    -   Conclude with \`[SUCCESS] Deployment successful. Endpoint is now active.\`.`;
    
    const userPrompt = `Generate the full deployment log for this configuration:
- Project Name: "${config.name}"
- Base Model: "${config.model?.name}"
- Compute Tier: "${config.computeTier?.name}"
- Data Source for Pre-training: ${dataSourceDescription}
- Fine-Tuning Method: "${config.fineTuningMethod?.name}"
`;

    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });

    const resultStream = await chat.sendMessageStream({ message: userPrompt });
    for await (const chunk of resultStream) {
        yield chunk.text;
    }
}

// FIX: Implement missing performDeepResearch function
export async function performDeepResearch(topic: string): Promise<{ report: string; sources: ResearchSource[] }> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a comprehensive report about "${topic}". The report should be well-structured, detailed, and informative.`,
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    const report = response.text;
    
    const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources: ResearchSource[] = rawSources
        .map((chunk: any) => ({
            uri: chunk.web?.uri,
            title: chunk.web?.title,
        }))
        .filter((source: any) => source.uri && source.title);

    return { report, sources };
}

// FIX: Implement missing generateModelCard function
export async function generateModelCard(config: ProjectConfig): Promise<string> {
    const systemInstruction = `You are a technical writer specializing in AI and Machine Learning. Your task is to generate a comprehensive and well-structured Model Card in Markdown format based on the provided project configuration.

The model card must include the following sections:
- **Model Details**: Name, base model, architecture, version.
- **Intended Use**: Primary intended uses and out-of-scope uses.
- **Training Data**: Description of the dataset used for pre-training and fine-tuning.
- **Training Procedure**: Details about the fine-tuning method (e.g., PEFT, Full Fine-tuning) and compute resources used.
- **Evaluation**: A brief, qualitative description of the model's performance based on its persona. (Since you don't have quantitative metrics, describe expected behavior).
- **Ethical Considerations & Limitations**: Discuss potential biases from the training data and limitations of the model's knowledge.
- **How to Use**: A brief example of how to interact with the model based on its persona.`;

    const userPrompt = `Generate the Model Card for this configuration:
- Project Name: "${config.name}"
- Base Model: "${config.model?.name} (${config.model?.parameters}B parameters)"
- Pre-training Data: "${config.dataMethod?.name}" on a dataset about "${config.datasetTopic}"
- Fine-tuning Method: "${config.fineTuningMethod?.name}"
- Compute Tier: "${config.computeTier?.name}"
- Persona: "${config.persona?.name}". Description: "${config.persona?.description}"
- Custom Persona Prompt (if any): ${config.customPersonaPrompt || 'N/A'}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: userPrompt }] }
        ],
        config: {
            systemInstruction: {
              role: 'model',
              parts: [{ text: systemInstruction }]
            },
        },
    });

    return response.text;
}
