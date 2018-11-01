import {StreamReadlineAsyncIterator} from "./StreamReadlineAsyncIterator";
import {toStringStream} from "./__helpers__/toStringStream";

describe('StreamReadlineAsyncIterator', () => {
    function createTestCase(strings: string[], end?: boolean) {
        const stream = toStringStream(strings, end);
        const iterator = new StreamReadlineAsyncIterator(stream);

        jest.spyOn(stream, 'pause');
        return { iterator, stream };
    }

    it('should pause stream if exiting via break', async () => {
        const lines: string[] = [];
        const { iterator, stream } = createTestCase(['1','2','3']);

        for await (const line of iterator) {
            lines.push(line);
            break;
        }

        expect(lines).toEqual(['1']);
        expect(stream.pause).toHaveBeenCalled();
    });

    it('should throw expections we get while awaiting', async () => {
        const lines: string[] = [];
        const { iterator, stream } = createTestCase(['something']);
        const error = new Error();

        try {
            for await (const line of iterator) {
                lines.push(line);

                process.nextTick(() => {
                    stream.emit('error', error);
                });
            }

            fail('expected for-await-of to go to the catch statement');
        } catch (e) {
            expect(e).toBe(error);
        }

        expect(lines).toEqual(['something']);
        expect(stream.pause).toHaveBeenCalled();
    });

    it('should pause stream if exiting due to the error', async () => {
        const lines: string[] = [];
        const { iterator, stream } = createTestCase(['1','2','3']);
        const error = new Error();

        try {
            for await (const line of iterator) {
                lines.push(line);
                stream.emit('error', error);
            }

            fail('expected for-await-of to go to the catch statement');
        } catch (e) {
            expect(e).toBe(error);
        }

        expect(lines).toEqual(['1', '2', '3']);
        expect(stream.pause).toHaveBeenCalled();
    });
});

