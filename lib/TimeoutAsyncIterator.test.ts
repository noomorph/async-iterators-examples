import {StreamReadlineAsyncIterator} from "./StreamReadlineAsyncIterator";
import {TimeoutAsyncIterator} from "./TimeoutAsyncIterator";
import {toStringStream} from "./__helpers__/toStringStream";
import {TimeoutAsyncIteratorOptions} from "./types/TimeoutAsyncIteratorOptions";

describe('TimeoutAsyncIterator', () => {
    function createTestCase(stream: NodeJS.ReadableStream, options: TimeoutAsyncIteratorOptions) {
        const streamIterator = new StreamReadlineAsyncIterator(stream);
        const timeoutIterator = new TimeoutAsyncIterator(options, streamIterator);

        jest.spyOn(streamIterator, 'dispose');
        return { timeoutIterator, streamIterator };
    }

    it('should act like a wrapper for another iterator', async () => {
        const stream = toStringStream(['42'], true);
        const { timeoutIterator } = createTestCase(stream, {
            timeout: 60000,
            timeoutError: new Error('No input received so far'),
        });

        const lines: string[] = [];
        for await (const line of timeoutIterator) {
            lines.push(line);
        }

        expect(lines).toEqual(['42']);
    });

    it('should dispose iterator when breaking from the loop', async () => {
        const stream = toStringStream(['42'], false);
        const { streamIterator, timeoutIterator } = createTestCase(stream, {
            timeout: 60000,
            timeoutError: new Error('No input received so far'),
        });

        for await (const _line of timeoutIterator) {
            break;
        }

        expect(streamIterator.dispose).toHaveBeenCalled();
    });

    it('should throw error on timeout and dispose the inner iterator', async () => {
        const options = {
            timeout: 100,
            timeoutError: new Error('No input received so far'),
        };

        const stream = toStringStream(['1', '2']);
        const { streamIterator, timeoutIterator } = createTestCase(stream, options);
        const lines: string[] = [];

        try {
            for await (const line of timeoutIterator) {
                lines.push(line);
            }

            fail('expected for-await-of to go to the catch statement');
        } catch (e) {
            expect(e).toBe(options.timeoutError);
        }

        expect(lines).toEqual(['1', '2']);
        expect(streamIterator.dispose).toHaveBeenCalled();
    });
});

