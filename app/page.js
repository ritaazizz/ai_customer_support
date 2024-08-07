'use client'

import { Box, Button, TextField, Stack } from "@mui/material";
import { useState } from "react";

export default function Home() {

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi. I am the Headstarter virtual assistant. How can I help you today?' }
  ])

  const [text, setText] = useState('')
  
  const sendMessage = async () => {

    setText('')
    setMessages((messages) => [ ...messages, { role: 'user', content: text }, { role: 'assistant', content: '' } ])

    // console.log('Payload:', JSON.stringify({ role: 'user', content: text }));
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'user', content: text })
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
              role: 'assistant'
            }
          ]
        })
        return reader.read().then(processText)
      })
    })

  }

  return (
    <Box 
      width={'100vw'}
      height={'100vh' } 
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      
      <Stack directon={'column'} width='600px' height='700px' border='1px solid black' justifyContent='flex-end' p={2} gap={2}>
        <Stack directon={'column'} spacing={2} flexGrow={1} overflow={'auto'} maxHeight={'100%'} >
          {
            messages.map((message, index) => (
              <Box
                key={index}
                display={'flex'}
                justifyContent={ message.role === 'assistant' ? 'flex-start' : 'flex-end' } 
              >
                <Box
                  bgcolor={ message.role === 'assistant' ? 'primary.main' : 'secondary.main' }
                  color={'white'}
                  borderRadius={11}
                  p={2}
                >
                  { message.content }
                </Box>
              </Box>
            ))
          }
        </Stack>
      
        <Stack flexDirection={'row'} gap={2}>
          <TextField label="Message" fullWidth value={text} onChange={(event) => setText(event.target.value)} />
          <Button variant="contained" size="medium" onClick={sendMessage} >Send</Button>
        </Stack>
      </Stack>
    </Box>
  )
}
