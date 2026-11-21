import type {Register} from 'claude-code'
import {buildSection, type Level} from "./prompt/sections";

const text = (v: unknown, fallback: string) =>
    typeof v === 'string' && v.trim() ? v.trim() : fallback;

const LEVELS: readonly Level[] = ['off', 'light', 'full'];
const level = (v: unknown): Level =>
    LEVELS.includes(v as Level) ? (v as Level) : 'light';

export const register: Register = (on, options) => {
    const majorName = text(options.majorName, '')
    const names: Names = {
        threads: text(options.threadName, 'workers'),
        coordinator: text(options.coordinatorName, 'the Republic'),
        major: majorName ? `Major ${majorName}` : 'Major',
    }
    const personality = level(options.personality)
    const section = buildSection(names, personality);

    on('prompt.compose', async ($, e, next) => {
        const result = await next(e) // build the normal system prompt first
        return {
            sections: [...result.sections, {id: 'the-republic:core', scope: 'session', text: section}],
        }
    });

    on('session.start', async ($, e, next) => {
        await $.command.register({name: 'republic', description: 'Show the names and personality The Republic uses'})
        return next(e)
    });

    on('command.run', {command: 'republic'}, async () => ({
        text: [
            `Coordinator: ${names.coordinator}`,
            `You: ${names.major}`,
            `Threads: ${names.threads}`,
            `Personality: ${personality}`,
            `Change these in the config menu under the-republic.`,
        ].join('\n'),
    }));
}
