import type { Category } from '../catalog'
import type { Block, Step } from '../engine'

/** Timing defaults a template block applies to every exercise added to it. */
export interface BlockDefaults {
  workSeconds: number
  restSeconds: number
}

export interface RoutineStep extends Step {
  id: string
}

export interface RoutineBlock extends Block {
  id: string
  steps: RoutineStep[]
  defaults?: BlockDefaults
}

/** A saved routine. Structurally an engine `Routine`, so it can be passed to the engine as is. */
export interface KataRoutine {
  id: string
  name: string
  category: Category
  pinned: boolean
  blocks: RoutineBlock[]
  createdFrom: 'blank' | 'template' | 'copy'
  createdAt: number
  updatedAt: number
  /** When it was last played (ms). Fed by the sessions store via `markRoutineDone`. */
  lastDone?: number
}
