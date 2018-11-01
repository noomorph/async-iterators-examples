import {Readable} from "stream";

export function toStringStream(strings: string[], end?: boolean): Readable {
    const readable = new Readable();

    readable._read = () => {}; // redundant? see update below
    for (const s of strings) {
        readable.push(s);
        readable.push('\n');
    }

    if (end) {
        readable.push(null);
    }

    return readable;
}
