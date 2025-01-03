import useWebsocket from 'react-use-websocket'
import { useEffect, useRef } from 'react'
import throttle from 'lodash.throttle'
import { Cursor } from './components/Cursor'


const renderCursors = users => {
   return Object.keys(users).map(uuid => {
    const user = users[uuid]
    return <Cursor key={uuid} point={[user.state.x, user.state.y]} /> 
   })
}

const renderUsersList = users => {
  return( 
    <ul>
      {Object.keys(users).map(uuid => {
        return <li key={uuid}>{JSON.stringify(users[uuid])}</li>
      })}
    </ul>
  )
}
export function Home({ username }) {

  const WS_URL = 'ws://localhost:8000'
  const { sendJsonMessage, lastJsonMessage } = useWebsocket(WS_URL, {
    queryParams: {
      username
    }
  })

  const THROTTLE = 50
  const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE))

  useEffect(() => {
    // ask the server to send the everyone's state when we load the component
    sendJsonMessage({ x: 0, y: 0 })
    window.addEventListener('mousemove', (e) => {
      sendJsonMessageThrottled.current({
        x: e.clientX,
        y: e.clientY
      })
    })  
  }, [])

  if (lastJsonMessage) {
    return <>
    {renderCursors(lastJsonMessage)}
    {renderUsersList(lastJsonMessage)}
    </>
  }
  return <h3>Hello {username}!</h3>
}