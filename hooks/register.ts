import type {Register} from 'claude-code'

const text = (v: unknown, fallback: string) =>
    typeof v === 'string' && v.trim() ? v.trim() : fallback;

export const register: Register = (on, options) => {
    const threads = text(options.threadName, 'workers');
    const coordinator = text(options.coordinatorName, 'the Republic');

    on('prompt.compose', async ($, e, next) => {
        const result = await next(e) // build the normal system prompt first
        return {
            sections: [...result.sections, {
                id: 'the-republic:core',
                scope: 'session',
                text:
                    `Naming preference: whenever you would say "thraed" or "threads" (a session or conversation thread, ` +
                    `or a subagent), say "${threads}" (adjust singular/plural naturally). Whenever you would say ` +
                    `"project coordinator" or refer to yourself as the main session, say "${coordinator}". ` +
                    `Use these names only in prose to the user. Keep real names in tool calls, code, file contents and commands.`,
            }],
        }
    });

    on('session.start', async ($, e, next) => {
        await $.command.register({name: 'republic', description: 'Show the names of the Republic uses'});
        return next(e);
    });

    on('command.run', {command: 'republic'}, async () => ({
        text: `Threads are called "${threads}" and the coordinator is "${coordinator}". Change them in the config menu under the-republic.`,
    }));
}