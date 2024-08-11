'use client';

import { Box, Button, TextField, Stack, Typography, Rating, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import Heading from '@/components/Heading';
import { MessageSquare } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi. I am the Headstarter virtual assistant. How can I help you today?',
    },
  ]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);

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

    const userMessage = text;
    setText('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '' },
    ]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'user', content: userMessage }),
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

  const openFeedbackDialog = () => {
    setFeedbackOpen(true);
  };

  const closeFeedbackDialog = () => {
    setFeedbackOpen(false);
    setRating(null);
    setFeedback('');
  };

  const submitFeedback = async () => {
    const feedbackData = {
      rating,
      feedback,
      message: messages[messages.length - 1].content,
    };

    await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    closeFeedbackDialog();
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
        title="Conversation"
        description="Our most advanced conversation model"
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
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
          <Button variant="outlined" size="medium" onClick={openFeedbackDialog}>
            Feedback
          </Button>
        </Stack>
      </Stack>

      <Dialog open={feedbackOpen} onClose={closeFeedbackDialog}>
        <DialogTitle>Provide Your Feedback</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Rate the Assistant's Response and provide additional feedback.
          </DialogContentText>
          <Rating
            name="feedback-rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Your Feedback"
            fullWidth
            multiline
            rows={4}
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFeedbackDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={submitFeedback}
            color="primary"
            disabled={!rating || !feedback.trim()}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
