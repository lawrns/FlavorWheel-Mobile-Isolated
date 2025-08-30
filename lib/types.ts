export type FlavorNode = {
  name: string
  value?: number
  // Optional: non-angular visual cue (e.g., opacity)
  intensity?: number
  children?: FlavorNode[]
}
