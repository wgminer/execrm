import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import firebase from 'firebase';

import NoteList from './NoteList';
import TaskList from './TaskList';
import db from '../firebase';

function Contact(props) {
  const [contact, setContact] = useState(null);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [formInput, setFormInput] = useState();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const unsubscribe = db
      .collection('contacts')
      .doc(props.match.params.id)
      .onSnapshot((snapshot) => {
        console.log(snapshot);
        if (snapshot.exists) {
          let doc = { ...snapshot.data() };
          doc.id = snapshot.id;
          setContact(doc);
          db.collection('contacts').doc(doc.id).set(
            {
              accessedAt: firebase.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }
      });
    return () => unsubscribe();
  }, [props.match.params.id]);

  async function deleteContact() {
    await db.collection('contacts').doc(contact.id).delete();
    setRedirect(true);
  }

  if (!contact) {
    document.title = `Loading | Execrm`;
    return 'Loading';
  }

  document.title = `${contact.firstName} ${contact.lastName} | Execrm`;

  if (redirect) {
    return <Redirect to="/contacts" />;
  }

  return (
    <div className="Contact">
      <h1>{contact.firstName + ' ' + contact.lastName}</h1>
      <div className="Contact__body">
        <div className="Contact__notes">
          {/*<h2>Notes</h2>*/}
          <NoteList contact={contact} />
        </div>
        <div className="Contact__tasks">
          {/*<h2>Tasks</h2>*/}
          <TaskList contactId={contact.id} />
        </div>
      </div>
      <button
        className="Contact__delete button button--delete"
        onClick={deleteContact}
      >
        Delete
      </button>
    </div>
  );
}

export default Contact;
