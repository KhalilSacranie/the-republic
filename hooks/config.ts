import type {EngineInterface} from 'claude-code'

export type Comrade = { name: string, github?: string }

export type RepublicConfig = {
    comrades: Comrade []
    init: { stack: string[]; extras: string[] }
}

export const CONFIG_PATH = '.claude/republic.json'

export const emptyConfig = (): RepublicConfig => ({comrades: [], init: {stack: [], extras: []}})

const isObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v)

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

const strings = (v: unknown): string[] =>
    Array.isArray(v) ? v.map(str).filter((s): s is string => s !== undefined) : []

const comrade = (v: unknown): Comrade | undefined => {
    if (!isObject(v)) return undefined
    const name = str(v.name)
    if (!name) return undefined
    const github = str(v.github)
    return github ? { name, github } : { name }
}

// Pure: never throws. Unknown keys are ignored, bad values fall back to defaults.
export const parseConfig = (raw: unknown): RepublicConfig => {
    if (!isObject(raw)) return emptyConfig()
    const init = isObject(raw.init) ? raw.init : {}
    return {
        comrades: Array.isArray(raw.comrades)
            ? raw.comrades.map(comrade).filter((c): c is Comrade => c !== undefined)
            : [],
        init: { stack: strings(init.stack), extras: strings(init.extras) },
    }
}

// Missing file or bad JSON gives the empty config.
// A function that takes $ must be a function declaration, not an arrow, for the engine to follow it.
export async function loadConfig($: EngineInterface): Promise<RepublicConfig> {
    try {
        if (!(await $.fs.exists(CONFIG_PATH))) return emptyConfig()
        return parseConfig(JSON.parse(await $.fs.read(CONFIG_PATH)))
    } catch {
        return emptyConfig()
    }
}
