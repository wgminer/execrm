import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import db from '../firebase';

function SideNav() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const unsubscribe = db.collection('contacts').onSnapshot((snapshot) => {
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
    <div className="SideNav">
      <NavLink to="/tasks">Tasks</NavLink>
      <NavLink to="/contacts">Contacts</NavLink>
      <div className="SideNav__title">Recent</div>
      {contacts.map((contact) => {
        return (
          <NavLink key={contact.id} to={'/contacts/' + contact.id}>
            {contact.firstName + ' ' + contact.lastName}
          </NavLink>
        );
      })}
    </div>
  );
}

export default SideNav;
