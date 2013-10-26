# organic-tissue

Organelle for spawning, restarting and killing processes while providing organic-like support for process resolving.

## DNA structure

    {
      "bindTo": String,
      "unwrapUncaughtExceptions": String,
      "captureType": String || "Tissue"
    }

## reacts on chemicals `dna.captureType`

### Expected chemical structure

    {
      "action": String,
      ... // properties depend on 
    }

#### when `action` has value 'start'

    {
      "action": "start",
      "argv": [],
      "output": true,
      "cwd": String,
      "env": Object || process.env,
      "target": String,
      "cmd": String
    }

-----
Returns chemical after reaction:

    {
      data: ChildProcess
    }


#### when `action` has value 'stop'

    {
      "action": "stop",
      "argv": [],
      "output": true,
      "cwd": String,
      "env": Object || process.env,
      "target": String
    }

-----
Returns chemical after reaction:

    {
      data: pid
    }

#### when `action` has value 'restart'

    {
      "action": "restart",
      "argv": [],
      "output": true,
      "cwd": String,
      "env": Object || process.env,
      "target": String
    }

-----
Returns chemical after reaction:

    {
      data: ChildProcess
    }

#### when `action` has value 'list'

    {
      "target": String
    }

-----
Returns chemical after reaction:

    {
      data: Array of {
        name: String,
        tissue: String,
        pid: String,
        marker: String
      }
    }

#### when `action` has value 'cleanup'

    {
      "target": String
    }

-----
Returns chemical after reaction:

    {
      data: Array of {
        name: String,
        tissue: String,
        pid: String,
        marker: String
      }
    }