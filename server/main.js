require('./lib/lib')
import home from './home'
import connections from './connections'
import settings from './settings'
import logs from './logs'
import submit from './submit'

export default function (server, localWS, wss) {
  home(localWS, wss)
  connections(localWS, wss)
  settings(localWS, wss)
  logs(localWS, wss)
  submit(localWS, wss)
}
