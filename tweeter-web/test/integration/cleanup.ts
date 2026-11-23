// AI-assisted: see AI-ATTRIBUTION.md

declare function require(name: string): {
  spawn: (
    command: string,
    args: string[],
    options: { stdio: ["pipe", "pipe", "pipe"] },
  ) => ChildProcess;
};
declare namespace require {
  function resolve(id: string): string;
}
declare const process: { execPath: string };

type TextChunk = { toString(): string };

type ChildProcess = {
  stdin: { end(data: string): void };
  stdout: { on(event: "data", listener: (chunk: TextChunk) => void): void };
  stderr: { on(event: "data", listener: (chunk: TextChunk) => void): void };
  on(event: "error", listener: (error: Error) => void): void;
  on(event: "close", listener: (code: number | null) => void): void;
};

const { spawn } = require("child_process");
const script = require.resolve("./deleteCreatedUsers.js");

export type CreatedUser = {
  alias: string;
  token: string;
  imageUrl: string;
};

export function deleteCreatedUsers(users: CreatedUser[]): Promise<void> {
  if (users.length === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let output = "";
    const append = (chunk: TextChunk) => {
      output += chunk.toString();
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(output.trim() || `Cleanup exited with code ${code}`));
      }
    });
    child.stdin.end(JSON.stringify(users));
  });
}
