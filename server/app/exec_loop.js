setInterval(() => {
  for (const file of require('readdir').readSync('./loop_process/', ['*.js'])) {
    const Process = require(`../loop_process/${file}`)

    switch (typeof Process) {
      // On peut instancier
      case 'function':
        new Process()
        break
    }
  }
}, parseInt(process.env.APP_TIMER_EXEC_LOOP * 1000) || 2000)
