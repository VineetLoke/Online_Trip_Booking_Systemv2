// Frontend Snippets Pack: Online Booking System
// Usage: paste into your frontend project or run in browser console after adjusting BASE and data.

const BASE = 'http://localhost:3000';
let TOKEN = localStorage.getItem('token') || '';

function setToken(t) {
  TOKEN = t; localStorage.setItem('token', t);
}

async function register(name, email, phone, password) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password })
  });
  const data = await res.json(); if (res.ok) setToken(data.token); return data;
}

async function login(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json(); if (res.ok) setToken(data.token); return data;
}

async function me() {
  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  return res.json();
}

async function searchFlights({ source, destination, date, airline } = {}) {
  const params = new URLSearchParams({ source, destination, date, airline });
  const res = await fetch(`${BASE}/api/search/flights?${params}`);
  return res.json();
}

async function createFlightBooking(flightId, passengerDetails) {
  const res = await fetch(`${BASE}/api/bookings/flights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ flightId, passengerDetails })
  });
  return res.json();
}

async function bookingHistory() {
  const res = await fetch(`${BASE}/api/bookings/history`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  return res.json();
}

async function cancelBooking(bookingId) {
  const res = await fetch(`${BASE}/api/bookings/${bookingId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN}` } });
  return res.json();
}

async function downloadTicket(bookingId) {
  const res = await fetch(`${BASE}/api/bookings/ticket/${bookingId}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `ticket_${bookingId}.pdf`; a.click(); URL.revokeObjectURL(url);
}

// Example flow
// (async () => {
//   await register('Alice', `alice${Date.now()}@example.com`, '+1-111-222-3333', 'password123');
//   const flights = await searchFlights({ source: 'DEL', destination: 'BOM' });
//   const firstFlightId = flights.flights?.[0]?._id;
//   if (firstFlightId) {
//     const booking = await createFlightBooking(firstFlightId, { name: 'Alice', age: 28, gender: 'Female' });
//     await downloadTicket(booking.booking._id);
//   }
// })();
