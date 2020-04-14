import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import TextareaAutosize from 'react-autosize-textarea';
import { fromUnixTime, format } from 'date-fns';
import firebase from 'firebase';
import ReactMarkdown from 'react-markdown';
import db from '../firebase';

function NoteTimestamp(props) {
  let text = format(new Date(), 'E, MMM dd');
  if (props.timestamp && props.timestamp.seconds) {
    text = format(fromUnixTime(props.timestamp.seconds), 'E, MMM dd @ h:mm a');
  }

  return <div className="Note__timestamp">{text}</div>;
}

function NoteList(props) {
  const [notes, setNotes] = useState([]);
  const [formInput, setFormInput] = useState('');
  const [focusedNote, setFocusedNote] = useState(false);

  useEffect(() => {
    let ref = db.collection('notes').orderBy('createdAt', 'desc');

    if (props.contact.id) {
      ref = ref.where('contactId', '==', props.contact.id);
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
  }, [props.contact.id]);

  function updateNote(e, index) {
    let notesCopy = [...notes];
    let note = notesCopy[index];
    note[e.target.name] = e.target.value;
    note.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    db.collection('notes').doc(note.id).set(note);
    notesCopy[index] = note;
    setNotes(notesCopy);
  }

  function deleteNote(e, index) {
    db.collection('notes').doc(notes[index].id).delete();
  }

  async function createNote(e) {
    e.preventDefault();
    let newNote = {
      text: '',
      title: '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (props.contact.id) {
      newNote.contactId = props.contact.id;
    }

    newNote = await db.collection('notes').add(newNote);
    setFocusedNote(newNote.id);
  }

  if (focusedNote) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }

  return (
    <div className="NoteList">
      <button className="button" onClick={createNote}>
        + New Note
      </button>
      {notes.map((note, index) => {
        if (focusedNote != note.id) {
          return (
            <div key={note.id} className="Note">
              <NoteTimestamp timestamp={note.createdAt} />
              <div
                className="Note__text Markdown"
                onClick={() => setFocusedNote(note.id)}
              >
                <ReactMarkdown source={note.text} />
              </div>
            </div>
          );
        }

        return (
          <div key={note.id} className="Note is--focused">
            <div className="Note__placeholder" />
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
                  onKeyUp={(e) => {
                    if (e.key === 'Escape') {
                      setFocusedNote(false);
                    }
                  }}
                  onChange={(e) => updateNote(e, index)}
                  value={note.text}
                />
                <div className="Note__details">
                  <dl>
                    <dt>Contact</dt>
                    <dd>
                      {props.contact.firstName + ' ' + props.contact.lastName}
                    </dd>

                    <dt>Created</dt>
                    <dd>
                      <NoteTimestamp timestamp={note.createdAt} />
                    </dd>
                  </dl>

                  <button
                    className="Note__delete button button--delete"
                    onClick={(e) => deleteNote(e, index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default NoteList;
