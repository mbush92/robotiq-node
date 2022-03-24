<p>
  <a href="#"><img src="https://codebuild.us-east-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiSlZ5bzhIMHdzQzJLK0I0SXF5ZG8xYmRNbW5YT1RtQ3gyZmxDaXlRdXdpb21NaTJzOGoxN2pJaFkrNkJCS1R1U0d3MFVBVHptZjJDa3ppT1BBUzVodHlFPSIsIml2UGFyYW1ldGVyU3BlYyI6IncrYjM5dFNHWDJNMHYzSlEiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master" alt="Build Status"></a>
  <a href="https://twitter.com/intent/follow?screen_name=Hirebotics"><img align="right" src="https://img.shields.io/twitter/follow/hirebotics.svg?style=social&label=Follow%20@Hirebotics" alt="Follow on Twitter"></a>
</p>

<h1 align="center">URScript Tools Example Project</h1>
<h2 align="center">Get started at <a href="https://github.com/Hirebotics/urscript-tools">URScript Tools</a></h2>
  
<br>
<br>
<br>

## Running the examples within this repository
To gain a better understanding of how the script executer, bundler and tester work we have generated some sample files.  Feel free to modify any of the files to see how changes in the files are reflected back into the different tools that we are showcasing.  
### Hello World Example

Use the Hello World example to learn the basics of script exection using the following command.

```bash
npm run inro
```

Result
```bash
Hello, welcome to urscript-tools!
Edit examples/intro/welcome.script to run your own code
```

### Running the Bundler Example

To see the results of bundling files you can execute the following command from the root director of the project

```bash
npm run bundle-basic
```
Once you run this command you will find the newly created bundle file at `examples/bundle-basic/dist/program.script`
### Running the Basic Test Example

To see how testing works you can run the following command, edit the function file and then run it again to see if your changes make the test fail or pass

```bash
npm run test-basic
```

You will see the results of the test printout in the terminal window.  If you want to see the bundled test file which can be useful for debugging issues with how the test files are bundled using the `urtester.config.json` file check out the file at `.urscript-test/test-harness/default.script`

### Running the Mock Test Example

To see how you can use `mock` functions within the unit test run

```bash
npm run test-mock
```