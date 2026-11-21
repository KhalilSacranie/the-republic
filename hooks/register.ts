import type {Register} from 'claude-code'
import {buildSection, type Level, type Names} from "./prompt/sections";
import {loadConfig, type RepublicConfig} from "./config";

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

    let config: Promise<RepublicConfig> | undefined

    on('session.start', async ($, e, next) => {
        config ??= loadConfig($);
        await $.command.register({
            name: 'republic',
            description: 'Show the names, personality and Comrades The Republic uses'
        })
        return next(e)
    });

    on('prompt.compose', async ($, e, next) => {
        const [result, {comrades}] = await Promise.all([next(e), (config ??= loadConfig($))])
        return {
            sections: [...result.sections, {
                id: 'the-republic:core',
                scope: 'session',
                text: buildSection(names, personality, comrades),
            }],
        }
    })

    on('command.run', {command: 'republic'}, async ($) => {
        const {comrades, init} = await loadConfig($)
        return {
            text: [
                `Coordinator: ${names.coordinator}`,
                `You: ${names.major}`,
                `Threads: ${names.threads}`,
                `Personality: ${personality}`,
                `Comrades: ${comrades.length ? comrades.map(c => c.name).join(', ') : 'none (add them to .claude/republic.json)'}`,
                `Stack: ${init.stack.length ? init.stack.join(', ') : 'not set'}`,
                `Change names and personality in the config menu under the-republic.`,
            ].join('\n'),
        }
    })

}
