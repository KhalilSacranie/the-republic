import type {Register} from 'claude-code'

export const register: Register = (on, options) => {
    on('prompt.compose', async ($, e, next) => {
        const result = await next(e) // build the normal system prompt first
        return {
            sections: [...result.sections, {
                id: 'the-republic:core',
                scope: 'session',
                text: `Call threads "${options.threadName ?? 'workers'}".`,
            }],
        }
    })
}