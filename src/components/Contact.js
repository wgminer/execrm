import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import db from '../firebase';

function Contact(props) {
  const [contact, setContact] = useState(null);
  const [notes, setNotes] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [formInput, setFormInput] = useState();

  // when the id attribute changes (including mount)
  // subscribe to the recipe document and update
  // our state when it changes.
  useEffect(() => {
    const unsubscribe = db
      .collection('contacts')
      .doc(props.match.params.id)
      .onSnapshot(doc => {
        setContact(doc);
      });
    return () => unsubscribe();
  }, [props.match.params.id]);

  function createNote() {
    let updatedNotes = [...notes];
    updatedNotes.push({
      id: Date.now(),
      title: '',
      text: 'hello world'
    });
    setNotes(updatedNotes);
  }

  function updateNote(id, e) {
    let updatedNotes = [...notes];
    let index = updatedNotes.findIndex(n => n.id == id);
    updatedNotes[index][e.target.name] = e.target.value;
    setNotes(updatedNotes);
  }

  function createTask(e) {
    e.preventDefault();
    let updatedTasks = [...tasks];
    updatedTasks.push({
      id: Date.now(),
      text: formInput
    });
    setFormInput('');
    setTasks(updatedTasks);
  }

  function updateTask(id, e) {
    let updatedTasks = [...tasks];
    let index = updatedTasks.findIndex(n => n.id == id);
    updatedTasks[index][e.target.name] = e.target.value;
    setTasks(updatedTasks);
  }

  return (
    <div className="Contact">
      <h1>{contact.firstName}</h1>
      <h2>Notes</h2>
      <button onClick={createNote}>New Note</button>
      <ul>
        {notes.map(note => {
          return (
            <li key={note.id}>
              <textarea
                name="text"
                value={note.text}
                onChange={e => updateNote(note.id, e)}
              />
            </li>
          );
        })}
      </ul>
      <h2>Tasks</h2>
      <form onSubmit={createTask}>
        <input onChange={e => setFormInput(e.target.value)} value={formInput} />
      </form>
      <ul>
        {tasks.map(task => {
          return (
            <li key={task.id}>
              <textarea
                name="text"
                value={task.text}
                onChange={e => updateTask(task.id, e)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Contact;
