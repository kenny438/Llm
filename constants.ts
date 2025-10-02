import type { Model, DataMethod, DataSource, ComputeTier, Persona } from './types';

export const MODELS: Model[] = [
  { id: 'llama-3', name: 'LLaMA 3 70B', category: 'General', description: 'Meta\'s powerful and versatile open-source model for a wide range of tasks.', parameters: 70 },
  { id: 'mistral-large', name: 'Mistral Large', category: 'General', description: 'Mistral AI\'s flagship model with top-tier reasoning capabilities.', parameters: 123 },
  { id: 'falcon-180b', name: 'Falcon 180B', category: 'General', description: 'A powerful open-source model from TII, excellent for complex reasoning.', parameters: 180 },
  { id: 'code-llama', name: 'Code LLaMA 34B', category: 'Specialized', description: 'A state-of-the-art model from Meta for code generation and understanding.', parameters: 34 },
  { id: 'phi-3', name: 'Phi-3 Mini', category: 'Specialized', description: 'Microsoft\'s small, powerful model designed for efficiency and on-device applications.', parameters: 3.8 },
  { id: 'custom-upload', name: 'Upload Your Own', category: 'Specialized', description: 'Upload a custom-trained base model in a supported format (e.g., GGUF, ONNX).', parameters: 0 },
];

export const DATA_METHODS: DataMethod[] = [
    { id: 'pretraining', name: 'Pretraining', description: 'Train a model from scratch. Requires massive datasets and compute resources.' },
];

export const FINE_TUNING_METHODS: DataMethod[] = [
    { id: 'full-fine-tuning', name: 'Full Fine-tuning', description: 'Retrain all layers of your freshly pretrained model. Offers deep customization but is compute-intensive.' },
    { id: 'parameter-efficient', name: 'PEFT (LoRA/QLoRA)', description: 'Adapt your model efficiently by training only a small subset of parameters. Faster and less costly.' },
];

export const DATA_SOURCES: DataSource[] = [
    { id: 'upload', name: 'Upload Dataset' },
    { id: 'cloud', name: 'Connect Cloud Storage' },
    { id: 'api', name: 'Scrape from APIs' },
];

export const COMPUTE_TIERS: ComputeTier[] = [
    { id: 'basic', name: 'Basic GPU', description: '1x NVIDIA T4 | 16GB vRAM', useCase: 'Ideal for experimentation, RAG, and PEFT on small models (< 7B).', costIndicator: '$' },
    { id: 'standard', name: 'Standard GPU Cluster', description: '4x NVIDIA A10G | 96GB vRAM', useCase: 'Perfect for PEFT on larger models or full fine-tuning up to 13B parameters.', costIndicator: '$$' },
    { id: 'performance', name: 'Performance TPU Pod', description: '16x Google TPU v4', useCase: 'Excellent for full fine-tuning of large models (70B+) or small pretraining runs.', costIndicator: '$$$' },
    { id: 'ultra', name: 'Ultra-Compute H100', description: '8x NVIDIA H100 | 640GB vRAM', useCase: 'For pretraining from scratch or fine-tuning massive models. The ultimate in ML power.', costIndicator: '$$$$' },
    { id: 'bussin', name: "Bussin' GPU Array", description: '64x NVIDIA Blackwell B200 | 11.5TB HBM3e', useCase: 'For literally anything. If you can dream it, this can train it. No cap.', costIndicator: '$$$$$' },
];

export const PERSONAS: Persona[] = [
    { id: 'helpful-assistant', name: 'Helpful Assistant', description: 'A friendly, professional, and reliable AI focused on providing accurate and safe information.', prompt: 'You are a friendly and helpful AI assistant. Your primary goal is to provide accurate, clear, and safe information to the user. Be polite and professional in all your responses.' },
    { id: 'witty-companion', name: 'Witty Companion', description: 'A conversational AI with a sense of humor and a slightly sarcastic edge. Great for engaging chats.', prompt: 'You are a witty and slightly sarcastic AI companion. You enjoy clever banter and making insightful, humorous observations. You are not afraid to have a personality, but you remain helpful.'},
    { id: 'formal-expert', name: 'Formal Expert', description: 'A precise, expert AI that provides detailed, formal, and technically accurate answers.', prompt: 'You are a formal and precise expert AI. Your responses must be technically accurate, well-structured, and detailed. Avoid slang, colloquialisms, and overly casual language. Cite sources when appropriate.' },
    { id: 'custom', name: 'Custom Persona', description: 'Define your own system prompt for complete control over the AI\'s behavior, tone, and rules.', prompt: '' },
];