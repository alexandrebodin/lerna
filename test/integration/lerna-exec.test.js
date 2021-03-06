import execa from "execa";

import { LERNA_BIN } from "../helpers/constants";
import initFixture from "../helpers/initFixture";
import initExecTest from "../helpers/initExecTest";

describe("lerna exec", () => {
  const env = initExecTest("ExecCommand");
  test.concurrent("--ignore <pkg> exec-test -- -1", async () => {
    const cwd = await initFixture("ExecCommand/basic");
    const args = [
      "exec",
      "--ignore=package-1",
      "exec-test",
      "--concurrency=1",
      "--",
      // args to exec-test
      "-1",
    ];

    const { stdout, stderr } = await execa(LERNA_BIN, args, { cwd, env });
    expect(stdout).toMatchSnapshot("stdout: exec-test --ignore");
    expect(stderr).toMatchSnapshot("stderr: exec-test --ignore");
  });

  test.concurrent("exec-test --scope <pkg>", async () => {
    const cwd = await initFixture("ExecCommand/basic");
    const args = [
      "exec",
      "--concurrency=1",
      "exec-test",
      "--scope=package-1",
      // no args to exec-test
    ];

    const { stdout, stderr } = await execa(LERNA_BIN, args, { cwd, env });
    expect(stdout).toMatchSnapshot("stdout: exec-test --scope");
    expect(stderr).toMatchSnapshot("stderr: exec-test --scope");
  });

  test.concurrent("without --", async () => {
    const cwd = await initFixture("ExecCommand/basic");
    const args = [
      "--concurrency=1",
      "exec",
      "exec-test",
      // no --
      "-C",
    ];

    const { stdout, stderr } = await execa(LERNA_BIN, args, { cwd, env });
    expect(stdout).toMatchSnapshot("stdout: without --");
    expect(stderr).toMatchSnapshot("stderr: without --");
  });

  test.concurrent("echo $LERNA_PACKAGE_NAME", async () => {
    const cwd = await initFixture("ExecCommand/basic");
    const args = [
      "exec",
      "--concurrency=1",
      "echo",
      (process.platform === "win32" ? "%LERNA_PACKAGE_NAME%" : "$LERNA_PACKAGE_NAME"),
    ];

    const { stdout, stderr } = await execa(LERNA_BIN, args, { cwd });
    expect(stdout).toMatchSnapshot("stdout: echo LERNA_PACKAGE_NAME");
    expect(stderr).toMatchSnapshot("stderr: echo LERNA_PACKAGE_NAME");
  });

  test.concurrent("<cmd> --parallel", async () => {
    const cwd = await initFixture("ExecCommand/basic");
    const args = [
      "exec",
      "exec-test",
      "--parallel",
      // no --
      "-C",
    ];

    const { stdout, stderr } = await execa(LERNA_BIN, args, { cwd, env });
    expect(stderr).toMatchSnapshot("stderr: <cmd> --parallel");

    // order is non-deterministic, so assert individually
    expect(stdout).toMatch("package-1: file-1.js");
    expect(stdout).toMatch("package-1: package.json");
    expect(stdout).toMatch("package-2: file-2.js");
    expect(stdout).toMatch("package-2: package.json");
  });

  test.concurrent("--parallel <cmd>", async () => {
    const cwd = await initFixture("ExecCommand/basic");
    const args = [
      "exec",
      "--parallel",
      "exec-test",
      // no --
      "-C",
    ];

    const { stdout, stderr } = await execa(LERNA_BIN, args, { cwd, env });
    expect(stderr).toMatchSnapshot("stderr: --parallel <cmd>");

    // order is non-deterministic, so assert individually
    expect(stdout).toMatch("package-1: file-1.js");
    expect(stdout).toMatch("package-1: package.json");
    expect(stdout).toMatch("package-2: file-2.js");
    expect(stdout).toMatch("package-2: package.json");
  });

  test.concurrent("--bail=false <cmd>", async () => {
    const cwd = await initFixture("ExecCommand/basic");
    const args = [
      "exec",
      "--bail=false",
      "--concurrency=1",
      "--",
      "npm run fail-or-succeed",
    ];

    const { stdout, stderr } = await execa(LERNA_BIN, args, { cwd });
    expect(stderr).toMatch(
      "Failed at the package-1@1.0.0 fail-or-succeed script"
    );
    expect(stdout).toMatch("failure!");
    expect(stdout).toMatch("success!");
  });

  test.concurrent("--no-bail <cmd>", async () => {
    const cwd = await initFixture("ExecCommand/basic");
    const args = [
      "exec",
      "--no-bail",
      "--concurrency=1",
      "--",
      "npm run fail-or-succeed",
    ];

    const { stdout, stderr } = await execa(LERNA_BIN, args, { cwd });
    expect(stderr).toMatch(
      "Failed at the package-1@1.0.0 fail-or-succeed script"
    );
    expect(stdout).toMatch("failure!");
    expect(stdout).toMatch("success!");
  });
});
