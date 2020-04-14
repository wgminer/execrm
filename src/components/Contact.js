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
          db.collection('recents').add({
            contactId: doc.id,
            firstName: doc.firstName,
            lastName: doc.lastName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
      });
    return () => unsubscribe();
  }, [props.match.params.id]);

  function createNote() {
    let updatedNotes = [...notes];
    let newNote = {
      title: '',
      text: 'hello world',
      contactId: contact.id,
    };
    updatedNotes.push(newNote);
    db.collection('notes').add(newNote);
    setNotes(updatedNotes);
  }

  function updateNote(id, e) {
    let updatedNotes = [...notes];
    let index = updatedNotes.findIndex((n) => n.id == id);
    updatedNotes[index][e.target.name] = e.target.value;
    setNotes(updatedNotes);
  }

  if (!contact) {
    document.title = `Loading | Execrm`;
    return 'Loading';
  }

  document.title = `${contact.firstName} ${contact.lastName} | Execrm`;

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
    </div>
  );
}

export default Contact;
