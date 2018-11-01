# node-async-iterators-kit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/noomorph/node-async-iterators-kit.svg?branch=master)](https://travis-ci.org/noomorph/node-async-iterators-kit)

Currently, the package provides a set of async iterators for handling readline, streams, child process stdout and timeouts:

* [ChildProcessStdioAsyncIterator](lib/ChildProcessStdioAsyncIterator.ts)
* [ReadlineAsyncIterator](lib/ReadlineAsyncIterator.ts)
* [StreamReadlineAsyncIterator](lib/StreamReadlineAsyncIterator.ts)
* [TimeoutAsyncIterator](lib/TimeoutAsyncIterator.ts)

See example:

```javascript
  const node = cp.spawn('node', ['-p', '2+2'], { stdio: 'pipe' });
  const iterator = new ChildProcessStdioAsyncIterator(node, 'stdout');

  for await (const line of iterator) {
      lines.push(line); // [4]
      break; // sends SIGTERM to the process if it has not exited yet
  }
```

