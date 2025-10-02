

export interface Model {
  id: string;
  name: string;
  category: 'General' | 'Specialized' | 'Media';
  description: string;
  parameters: number; // in billions
}

export interface DataMethod {
  id:string;
  name: string;
  description: string;
}

export interface DataSource {
    id: string;
    name: string;
}

export interface ComputeTier {
    id: string;
    name: string;
    description: string;
    useCase: string;
    costIndicator: string;
}

export interface Persona {
    id: string;
    name: string;
    description: string;
    prompt: string;
}

export interface ResearchSource {
  uri: string;
  title: string;
}

export interface ProjectConfig {
  name: string;
  model: Model | null;
  dataMethod: DataMethod | null;
  fineTuningMethod?: DataMethod | null;
  dataSource: DataSource | null;
  datasetTopic?: string;
  generatedDataset?: string;
  researchSources?: ResearchSource[];
  computeTier: ComputeTier | null;
  persona: Persona | null;
  customPersonaPrompt?: string;
}

export enum ProjectStatus {
    CONFIGURING = 'Configuring',
    PROVISIONING = 'Provisioning',
    TRAINING = 'Training',
    DEPLOYING = 'Deploying',
    ACTIVE = 'Active',
    FAILED = 'Failed',
}

export interface TrainingMetric {
    epoch: number;
    loss: number;
}

export interface Project {
    id: string;
    config: ProjectConfig;
    status: ProjectStatus;
    logLines: string[];
    metrics: TrainingMetric[];
}

export enum AppView {
  DASHBOARD,
  PROJECT_WIZARD,
  PROJECT_DETAIL,
  PLAYGROUND,
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}