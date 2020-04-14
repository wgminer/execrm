import React, { useState, useEffect } from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import firebase from 'firebase';
import db from '../firebase';

function ContactNew() {
  const [contact, setContact] = useState({});
  const [contactId, setContactId] = useState(false);

  function updateContact(e) {
    let contactCopy = { ...contact };
    contactCopy[e.target.firstName] = e.target.value;
    setContact(contactCopy);
  }

  async function createContact(e) {
    e.preventDefault();
    let { id } = await db.collection('contacts').add({
      firstName: contact.firstName,
      lastName: contact.lastName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setContactId(id);
  }

  if (contactId) {
    return <Redirect to={'/contacts/' + contactId} />;
  }

  return (
    <div className="ContactNew">
      <h1>New Contact</h1>
      <form onSubmit={createContact}>
        <label>
          First Name
          <input
            autoFocus={true}
            name="firstName"
            value={contact.firstName}
            onChange={updateContact}
          />
        </label>
        <label>
          Last Name
          <input
            name="lastName"
            value={contact.lastName}
            onChange={updateContact}
          />
        </label>
        <button className="button">Save</button>
      </form>
    </div>
  );
}

export default ContactNew;
