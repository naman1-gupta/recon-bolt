const process = require("child_process");
const data = require('./data/agent-data');


console.log(data)
data.agentData.filter()
data.agentData.forEach(d => {
    // console.log(d.displayName)
    process.exec(`curl ${d.displayIconSmall} -o assets/agents/${d.displayName.toLowerCase()}.png`, (err, stdout, stderr) => {
        console.log(stdout)
        console.log(stderr)
        console.log(err)
    })
})