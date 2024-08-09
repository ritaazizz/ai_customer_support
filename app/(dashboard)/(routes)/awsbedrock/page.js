'use client';

import { Box, Button, TextField, Stack } from '@mui/material';
import { Code } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Heading from '@/components/Heading';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi. I am the Headstarter virtual assistant. How can I help you today?',
    },
  ]);

  const [text, setText] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) {
      return;
    }

    const formData = new FormData();
    formData.append('userQuestion', text);

    setText('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: text },
      { role: 'assistant', content: '' },
    ]);

    const response = await fetch('/api/aws', {
      method: 'POST',
      body: formData,
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
              role: 'assistant',
            },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  return (
    <Box
      width={'100vw'}
      height={'100vh'}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <Heading
        title="Code Generation"
        description="Generate code using descriptive text"
        icon={Code}
        iconColor="text-green-700"
        bgColor="bg-green-700/10"
      />
      <Stack
        direction={'column'}
        width="600px"
        height="700px"
        border="1px solid black"
        borderRadius={4}
        justifyContent="flex-end"
        p={2}
        gap={2}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow={'auto'}
          maxHeight={'100%'}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display={'flex'}
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color={'white'}
                borderRadius={11}
                p={2}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        <Stack flexDirection={'row'} gap={2}>
          <TextField
            label="Message"
            fullWidth
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          <Button variant="contained" size="medium" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
