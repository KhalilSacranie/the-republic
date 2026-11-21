import { test, expect } from 'claude-code/testing';
import { buildSection } from '../hooks/prompt/sections'

const run = { command: 'republic', args: '', origin: { kind: 'composer' as const }, presentation: { isFullscreen: false, columns: 80 } }

test('/republic shows defaults', async ($) => {
    const r = await $.command.run(run)
    expect(r.text).toContain('You: Major\n')
    expect(r.text).toContain('Personality: light')
})

test('/republic uses majorName and personality', { options: { majorName: 'Khalil', personality: 'full' } }, async ($) => {
    const r = await $.command.run(run)
    expect(r.text).toContain('Major Khalil')
    expect(r.text).toContain('Personality: full')
})

test('off drops the tone but keeps the plain rules', () => {
    const s = buildSection({ threads: 'workers', coordinator: 'the Republic', major: 'Major' }, 'off')
    expect(s).not.toContain('## Personality')
    expect(s).toContain('## Keep the work plain')
})