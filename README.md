END-TO-END: Node.js → EC2 → CloudWatch Logs
🧱 Architecture
Node.js app → app.log → CloudWatch Agent → CloudWatch Logs
✅ STEP 1 — Launch EC2

In AWS Console:

Launch Amazon Linux 2

Instance type: t2.micro (for testing)

Security group:

SSH (22)

App port (3000) for testing

Create key pair

✅ Launch instance

✅ STEP 2 — Attach IAM Role (VERY IMPORTANT)

Create role with policy:

CloudWatchAgentServerPolicy

Attach role to EC2.

🎯 Without this → logs will never reach CloudWatch.

✅ STEP 3 — Connect to EC2
ssh -i key.pem ec2-user@<public-ip>
✅ STEP 4 — Install Node.js
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs

Verify:

node -v
npm -v
✅ STEP 5 — Create Project Folder
mkdir Node-js-cloudwatch
cd Node-js-cloudwatch
✅ STEP 6 — Create Node App
nano app.js

Paste:

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const logFile = path.join(__dirname, 'app.log');

function writeLog(message) {
  const log = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync(logFile, log);
}

app.get('/', (req, res) => {
  writeLog('Home API hit');
  res.send('Node App Running 🚀');
});

app.listen(PORT, () => {
  writeLog(`Server started on port ${PORT}`);
});

Save.

✅ STEP 7 — Install Dependencies
npm init -y
npm install express
✅ STEP 8 — Run App
node app.js

Test in browser:

http://<EC2-PUBLIC-IP>:3000
✅ STEP 9 — Verify Log File Created
ls -l /home/ec2-user/Node-js-cloudwatch/app.log

✅ Must exist.

☁️ STEP 10 — Install CloudWatch Agent
sudo yum install amazon-cloudwatch-agent -y
✅ STEP 11 — Create Config File
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

Paste this final working config:

{
  "agent": {
    "metrics_collection_interval": 10,
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/home/ec2-user/Node-js-cloudwatch/app.log",
            "log_group_name": "nodejs-app-logs",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 7
          }
        ]
      }
    }
  }
}

Save.

✅ STEP 12 — Start CloudWatch Agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s
✅ STEP 13 — Verify Agent
sudo systemctl status amazon-cloudwatch-agent

Must show:

active (running)
✅ STEP 14 — Verify in AWS Console

Go to:

CloudWatch → Log Groups → nodejs-app-logs

🎉 You will see logs.
