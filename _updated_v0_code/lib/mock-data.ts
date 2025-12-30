import type { Task, Project } from "./types"

export const initialTasks: Task = {
  id: "root",
  title: "Produce Music Album",
  estimate: 300,
  depth: 0,
  isExpanded: true,
  children: [
    {
      id: "compose",
      title: "Compose Songs",
      estimate: 120,
      depth: 1,
      isExpanded: false,
      children: [
        {
          id: "melody",
          title: "Write Melodies",
          estimate: 60,
          depth: 2,
          children: [],
        },
        {
          id: "lyrics",
          title: "Write Lyrics",
          estimate: 60,
          depth: 2,
          children: [],
        },
      ],
    },
    {
      id: "record-piano",
      title: "Record Piano Piece",
      estimate: 30,
      depth: 1,
      isExpanded: true,
      children: [
        {
          id: "setup-gear",
          title: "Setup & Gear",
          estimate: 5,
          depth: 2,
          children: [],
        },
        {
          id: "recording-phase",
          title: "Recording Phase",
          estimate: 20,
          depth: 2,
          isExpanded: true,
          children: [
            {
              id: "warmup",
              title: "Warm up scales",
              estimate: 5,
              depth: 3,
              children: [],
            },
            {
              id: "take1",
              title: "Take 1",
              estimate: 5,
              depth: 3,
              children: [],
            },
            {
              id: "take2",
              title: "Take 2",
              estimate: 10,
              depth: 3,
              children: [],
            },
          ],
        },
        {
          id: "file-management",
          title: "File Management",
          estimate: 10,
          depth: 2,
          children: [],
        },
      ],
    },
  ],
}

export const projects: Project[] = [
  { id: "album", name: "Album Recording", emoji: "🎵", mode: "creative" },
  { id: "website", name: "Website Redesign", emoji: "💻", mode: "technical" },
  { id: "taxes", name: "Taxes 2024", emoji: "📄", mode: "admin" },
]
