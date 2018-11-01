import * as readline from "readline";
import {ReadlineAsyncIterator} from "./ReadlineAsyncIterator";
import {toStringStream} from "./__helpers__/toStringStream";

describe('ReadlineAsyncIterator', () => {
    function createTestCase(strings: string[], end?: boolean) {
        const stream = toStringStream(strings, end);
        const rl = readline.createInterface({ input: stream, terminal: false });
        const iterator = new ReadlineAsyncIterator(rl);

        jest.spyOn(rl, 'close');
        return { iterator, rl, stream };
    }

    it('should enable for-await-of loop', async () => {
        const lines: string[] = [];
        const { iterator } = createTestCase(['1','2','3'], true);

        for await (const line of iterator) {
            lines.push(line);
        }

        expect(lines).toEqual(['1','2','3']);
    });

    it('should ensure exit when stream ends while awaiting for the next value', async () => {
        const lines: string[] = [];
        const { iterator, stream } = createTestCase(['something']);

        for await (const line of iterator) {
            lines.push(line);
            process.nextTick(() => stream.push(null));
        }

        expect(lines).toEqual(['something']);
    });

    it('should ensure exit when loop is being broken', async () => {
        const lines: string[] = [];
        const { iterator, rl } = createTestCase(['1','2','3']);

        for await (const line of iterator) {
            lines.push(line);
            break;
        }

        expect(lines).toEqual(['1']);
        expect(rl.close).toHaveBeenCalled();
    });

    it('should close readline if an error is thrown inside the loop', async () => {
        const lines: string[] = [];
        const { iterator, rl } = createTestCase(['1','2','3']);
        const error = new Error();

        try {
            for await (const line of iterator) {
                lines.push(line);
                throw error;
            }
            fail('expected for-await-of to go to the catch statement');
        } catch (e) {
            expect(e).toBe(error);
        }

        expect(lines).toEqual(['1']);
        expect(rl.close).toHaveBeenCalled();
    });
});

