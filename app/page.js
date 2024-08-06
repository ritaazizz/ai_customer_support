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
    setMessages((messages) => [ ...messages, { role: 'user', content: text } ])

    // console.log('Payload:', JSON.stringify({ role: 'user', content: text }));
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'user', content: text })
    })

    // if (!response.ok) {
    //   // Log the status and status text for debugging
    //   console.error(`Error: ${response.status} ${response.statusText}`);
    //   return;
    // }
    
    const data = await response.json()        
    setMessages((messages) => [ ...messages, { role: 'assistant', content: data.message } ])
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
        <Stack directon={'column'} spacing={2} alignItems={'flex-start'} flexGrow={1} overflow={'auto'} maxHeight={'100%'} >
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
