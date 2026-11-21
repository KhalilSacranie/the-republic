import { test, expect } from 'claude-code/testing';

test('/republic shows the configured names', { options: {coordinatorName: 'the Soviet'}}, async ($) => {
    const r = await $.command.run({
        command: 'republic', args: '',
        origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 },
    });
    expect(r.text).toContain('the Soviet');
    expect(r.text).toContain('workers');
})