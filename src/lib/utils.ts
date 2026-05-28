import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ContentMode = "text" | "image" | "video" | "audio"

export type ContentTemplate = {
  id: string
  name: string
  category: "blog" | "ads" | "newsletter" | "social" | "product" | "video-script"
  description: string
  prompt: string
}

export type BrandVoice = {
  id: string
  name: string
  tone: string
  style: string
  guidelines: string
}

export type SEOSuggestion = {
  keyword: string
  searchVolume: number
  difficulty: number
  serpFeatures: string[]
}

export type Task = {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  assignee?: string
  dueDate?: string
  tags: string[]
  timeSpent?: number
}

export type Workspace = {
  id: string
  name: string
  type: "personal" | "team" | "project"
}