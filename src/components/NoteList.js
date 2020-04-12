import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import TextareaAutosize from 'react-autosize-textarea';
import { fromUnixTime, format } from 'date-fns';
import firebase from 'firebase';
import db from '../firebase';

function NoteList(props) {
  const [notes, setNotes] = useState([]);
  const [formInput, setFormInput] = useState('');
  const [focusedNote, setFocusedNote] = useState(false);

  useEffect(() => {
    let ref = db.collection('notes').orderBy('createdAt', 'desc');

    if (props.contactId) {
      ref = ref.where('contactId', '==', props.contactId);
    }

    const unsubscribe = ref.onSnapshot((snapshot) => {
      if (snapshot.size) {
        let notesArray = [];
        snapshot.forEach((doc) => {
          let data = { ...doc.data() };
          data.id = doc.id;
          notesArray.push(data);
        });
        setNotes(notesArray);
      } else {
        setNotes([]);
      }
    });
    return () => unsubscribe();
  }, [props.contactId]);

  function updateNote(e, index) {
    let note = notes[index];
    note[e.target.name] = e.target.value;
    note.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    db.collection('notes').doc(note.id).set(note);
  }

  async function createNote(e) {
    let newNote = {
      text: '',
      title: '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (props.contactId) {
      newNote.contactId = props.contactId;
    }

    db.collection('notes').add(newNote);
  }

  if (focusedNote) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }

  console.log(notes);

  return (
    <div className="NoteList">
      {/*<button onClick={createNote}>New Note</button>*/}
      <ul>
        {notes.map((note, index) => {
          if (focusedNote != note.id) {
            return (
              <div key={note.id} className="Note">
                <div className="Note__timestamp">
                  {format(fromUnixTime(note.createdAt.seconds), 'E, MMM dd')}
                </div>
                <div
                  className="Note__text"
                  onClick={() => setFocusedNote(note.id)}
                >
                  {note.text}
                </div>
              </div>
            );
          }

          return (
            <li key={note.id} className="Note">
              <div
                className="Note__overlay"
                onClick={() => setFocusedNote(false)}
              >
                <div
                  className="Note__editor"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TextareaAutosize
                    autoFocus={true}
                    name="text"
                    // onBlur={() => setFocusedNote(false)}
                    onChange={(e) => updateNote(e, index)}
                    value={note.text}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default NoteList;
