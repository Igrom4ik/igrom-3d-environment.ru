"use client";

import { Button, Column, Heading, Input, Text } from "@once-ui-system/core";
import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage("");

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to send message');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error occurred');
    }
  };

  return (
    <Column
      as="form"
      onSubmit={handleSubmit}
      fillWidth
      padding="l"
      gap="m"
      background="surface"
      border="neutral-medium"
      radius="l"
      id="contact-form"
    >
      <Heading variant="heading-strong-m">Связаться со мной</Heading>
      
      <Input
        id="name"
        name="name"
        label="Имя"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Ваше имя"
      />
      
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="example@mail.com"
      />

      <Column gap="xs">
        <Text as="label" variant="label-default-s" htmlFor="message">Сообщение</Text>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="Текст сообщения..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-m)',
            border: '1px solid var(--neutral-border-medium)',
            background: 'var(--neutral-background-medium)',
            color: 'var(--neutral-on-background-strong)',
            fontFamily: 'inherit',
            fontSize: 'var(--font-size-body-default-m)',
            resize: 'vertical',
            outline: 'none',
            minHeight: '120px'
          }}
        />
      </Column>

      {status === 'error' && (
        <Text variant="body-default-s" style={{ color: 'var(--danger-medium)' }}>
          {errorMessage}
        </Text>
      )}

      {status === 'success' && (
        <Text variant="body-default-s" style={{ color: 'var(--success-medium)' }}>
          Сообщение успешно отправлено!
        </Text>
      )}

      <Button
        type="submit"
        variant="primary"
        loading={status === 'loading'}
        label="Отправить"
      />
    </Column>
  );
}
