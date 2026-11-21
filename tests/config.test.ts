import { test, expect } from 'claude-code/testing'
import { parseConfig, CONFIG_PATH } from '../hooks/config'
import { buildSection } from '../hooks/prompt/sections'

const run = { command: 'republic', args: '', origin: { kind: 'composer' as const }, presentation: { isFullscreen: false, columns: 80 } }

// The engine hands fs hooks an absolute path, so match on the ending.
const isConfig = (path: string) => path.replaceAll('\\', '/').endsWith(CONFIG_PATH)

const config = JSON.stringify({
    comrades: [{ name: 'Dana', github: 'dana-dev' }, { name: '' }, 42],
    init: { stack: ['flutter'] },
    unknown: true,
})

test('parseConfig keeps good values and drops bad ones', () => {
    expect(parseConfig(JSON.parse(config))).toEqual({
        comrades: [{ name: 'Dana', github: 'dana-dev' }],
        init: { stack: ['flutter'], extras: [] },
    })
    expect(parseConfig('nonsense').comrades).toEqual([])
})

test('/republic lists Comrades from the project file', async ($, on) => {
    on('fs.exists', async (_$, e) => ({ value: isConfig(e.path) }))
    on('fs.read', async (_$, e) => ({ value: isConfig(e.path) ? config : '' }))
    const r = await $.command.run(run)
    expect(r.text).toContain('Comrades: Dana')
    expect(r.text).toContain('Stack: flutter')
})

test('a missing file means no Comrades', async ($, on) => {
    on('fs.exists', async () => ({ value: false }))
    const r = await $.command.run(run)
    expect(r.text).toContain('Comrades: none')
})

test('bad JSON falls back to empty', async ($, on) => {
    on('fs.exists', async () => ({ value: true }))
    on('fs.read', async () => ({ value: '{ not json' }))
    const r = await $.command.run(run)
    expect(r.text).toContain('Comrades: none')
})

test('Comrades reach the prompt section', () => {
    const s = buildSection({ threads: 'workers', coordinator: 'the Republic', major: 'Major' }, 'light', parseConfig(JSON.parse(config)).comrades)
    expect(s).toContain('- Dana (GitHub: dana-dev)')
})