import React, { useState, useEffect } from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import firebase from 'firebase';
import db from '../firebase';

function ContactNew() {
  const [contact, setContact] = useState({});
  const [redirect, setRedirect] = useState(false);

  function updateContact(e) {
    let contactCopy = { ...contact };
    contactCopy[e.target.name] = e.target.value;
    setContact(contactCopy);
  }

  async function saveContact(e) {
    e.preventDefault();
    contact.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    let { id } = await db.collection('contacts').set(contact);
    setRedirect(id);
  }

  if (redirect) {
    return <Redirect to={'/contacts/' + redirect} />;
  }

  document.title = `New Contact | Execrm`;

  return (
    <div className="ContactNew">
      <h1>New Contact</h1>
      <form onSubmit={saveContact}>
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
        <label>
          Title
          <input name="title" value={contact.title} onChange={updateContact} />
        </label>
        <label>
          Organization
          <input
            name="organization"
            value={contact.organization}
            onChange={updateContact}
          />
        </label>
        <button className="button">Save</button>
      </form>
    </div>
  );
}

export default ContactNew;
