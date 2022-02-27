# nvim-dap-reactnative
Standalone debug adapter protocol for react native. Hopefully won't have any specific editor/ide stuff

As of now, first commit. Working for neovim using vscode-node-debug2 adapter

### Steps to run

1. Open src/standalone.ts and update your project directory paths
2. Start react native metro bundler and make sure its running on 8081
3. After running tsc on this directory once, run node src/standalone.js
4. Now run the app in android emulator, it would wait on a white screen for debugger to attach, if its not a white empty screen then something didn't go well
5. Now on neovim, setup your breakpoints and run dap continue with below config

```
M.config = {
	adapters = {
		type = "executable",
		command = "node",
		args = { dbg_path .. "vscode-node-debug2/out/src/nodeDebug.js" },
	},
	configurations = {
		{
			type = "node2",
			request = "attach",
			program = "${file}",
			cwd = fn.getcwd(),
			sourceMaps = true,
			protocol = "inspector",
			console = "integratedTerminal",
			port = 35000
		},
	},
}
```
It should start with a debug waiting on some unknown location, ignore it and do dap_continue, it will again stop on another unknown location, do dap_continue.
Now it should start hitting the app's breakpoints

After you finish debugging, if you make code changes, don't just refresh app, close the current debug session with dap_close()
Open emulator and hit rr, it will refresh and wait on white screen
Do dap_continue or runlast and you are good to go
