import * as cp from "child_process";
import {ChildProcessStdioAsyncIterator} from "./ChildProcessStdioAsyncIterator";
import {ChildProcess} from "child_process";

describe('ChildProcessStdioAsyncIterator', () => {
    function evaluate(expression: string): ChildProcess {
        return cp.spawn('node', ['-e', expression], { stdio: 'pipe' });
    }

    it('should wrap child process as an iterator', async () => {
        const lines: string[] = [];
        const node = evaluate('console.log(1),console.log(2)');
        const iterator = new ChildProcessStdioAsyncIterator(node, 'stdout');

        for await (const line of iterator) {
            lines.push(line);
        }

        expect(lines).toEqual(['1', '2']);
    });

    it('should kill child process if requested to break', async () => {
        const lines: string[] = [];
        const node = cp.spawn('node', ['-p', '2+2'], { stdio: 'pipe' });
        spyOn(node, 'kill');
        const iterator = new ChildProcessStdioAsyncIterator(node, 'stdout');

        for await (const line of iterator) {
            lines.push(line);
            break;
        }

        expect(node.kill).toHaveBeenCalled();
        expect(lines).toEqual(['4']);
    });
});
