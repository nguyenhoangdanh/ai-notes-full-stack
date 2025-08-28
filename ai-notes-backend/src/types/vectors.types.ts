export interface TextChunk {
  id: string;
  content: string;
  index: number;
  heading?: string;
}

export interface EmbeddedChunk extends TextChunk {
  embedding: number[];
}