import  { useState } from 'react';
import styles from './contact.module.css';
import Header from '../components/header';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) setStatus('Message sent successfully!');
      else setStatus(data.error || 'Failed to send message.');
    } catch (err) {
      setStatus('Failed to send message.');
    }
  };

  return (
    <div className={styles.contactBg}>
      <Header />
      <main>
        <section className={styles.contactCard}>
          <h1>Contact Us</h1>
          <form onSubmit={handleSubmit} className={styles.contactForm}>
            <input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Your Email" value={form.email} onChange={handleChange} required />
            <textarea name="message" placeholder="Your Message" value={form.message} onChange={handleChange} required />
            <button type="submit">Send</button>
          </form>
          {status && <div className={styles.contactStatus}>{status}</div>}
        </section>
      </main>
    </div>
  );
};

export default Contact;
