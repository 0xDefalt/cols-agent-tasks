"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tmrm = require("azure-pipelines-task-lib/mock-run");
const path = require("path");
const fs = require("fs");
let rootDir = path.join(__dirname, '../../Tasks', 'ReplaceTokens');
let taskPath = path.join(rootDir, 'replaceTokens.js');
let tmr = new tmrm.TaskMockRunner(taskPath);
// set up a tmp file for the test
var workingFolder = path.join(__dirname, "working");
if (!fs.existsSync(workingFolder)) {
    fs.mkdirSync(workingFolder);
}
var tmpFile = path.join(workingFolder, "file.config");
// provide answers for task mock
console.log("----------------- " + workingFolder);
let a = {
    "checkPath": {
        "working": true
    },
    "findMatch": {
        "*.config": [tmpFile]
    }
};
tmr.setAnswers(a);
fs.writeFile(tmpFile, `
<configuration>
  <appSettings>
    <add key="CoolKey" value="__CoolKey__" />
    <add key="Secret1" value="__Secret1__" />
  </appSettings>
</configuration>
`, (err) => {
    // set inputs
    tmr.setInput('filePattern', '*.config');
    tmr.setInput('tokenRegex', '__(\\w+)__');
    // set variables
    process.env["COOLKEY"] = "MyCoolKey";
    process.env["SECRET_Secret1"] = "supersecret1";
    process.env["BUILD_SOURCESDIRECTORY"] = "working";
    tmr.run();
    // validate the replacement
    let actual = fs.readFileSync(tmpFile).toString();
    var expected = `
<configuration>
  <appSettings>
    <add key="CoolKey" value="MyCoolKey" />
    <add key="Secret1" value="supersecret1" />
  </appSettings>
</configuration>
  `;
    if (actual.trim() !== expected.trim()) {
        console.log(actual);
        console.error("Replacement failed.");
    }
    else {
        console.log("Replacement succeeded!");
    }
});
//# sourceMappingURL=test-emptyPath.js.map