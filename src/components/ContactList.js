import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import db from '../firebase';

function ContactList() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const unsubscribe = db
      .collection('contacts')
      .orderBy('firstName', 'asc')
      .onSnapshot((snapshot) => {
        console.log(snapshot);
        if (snapshot.size) {
          let contactsArray = [];
          snapshot.forEach((doc) => {
            let data = { ...doc.data() };
            data.id = doc.id;
            contactsArray.push(data);
          });
          setContacts(contactsArray);
        }
      });
    return () => unsubscribe();
  }, []);

  return (
    <div className="ContactList">
      <h1>Contacts</h1>
      <NavLink to="contacts/new">+ New Contact</NavLink>
      <ul>
        {contacts.map((contact) => {
          return (
            <li key={contact.id}>
              <NavLink className="title" to={'/contacts/' + contact.id}>
                {contact.firstName + ' ' + contact.lastName}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ContactList;
