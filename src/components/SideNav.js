import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { uniqBy } from 'lodash';
import db from '../firebase';

function SideNav() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const unsubscribe = db
      .collection('recents')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        console.log(snapshot);
        if (snapshot.size) {
          let contactsArray = [];
          snapshot.forEach((doc) => {
            let data = { ...doc.data() };
            data.id = doc.id;
            contactsArray.push(data);
          });
          contactsArray = uniqBy(contactsArray, (e) => e.contactId).slice(0, 5);
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
      {contacts.map((recent) => {
        return (
          <NavLink key={recent.id} to={'/contacts/' + recent.contactId}>
            {recent.firstName + ' ' + recent.lastName}
          </NavLink>
        );
      })}
    </div>
  );
}

export default SideNav;
