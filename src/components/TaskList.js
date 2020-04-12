import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import TextareaAutosize from 'react-autosize-textarea';

import {
  Check as CompleteIcon,
  RadioButtonUnchecked as IncompleteIcon,
} from '@material-ui/icons';
import firebase from 'firebase';
import db from '../firebase';

function TaskList(props) {
  const [tasks, setTasks] = useState([]);
  const [formInput, setFormInput] = useState('');

  useEffect(() => {
    let ref = db.collection('tasks').orderBy('createdAt', 'desc');

    if (props.contactId) {
      ref = ref.where('contactId', '==', props.contactId);
    }

    const unsubscribe = ref.onSnapshot((snapshot) => {
      if (snapshot.size) {
        let tasksArray = [];
        snapshot.forEach((doc) => {
          let data = { ...doc.data() };
          data.id = doc.id;
          tasksArray.push(data);
        });
        setTasks(tasksArray);
      } else {
        setTasks([]);
      }
    });
    return () => unsubscribe();
  }, [props.contactId]);

  function updateTask(e, i) {
    let task = tasks[i];
    task[e.target.name] = e.target.value;
    task.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    db.collection('tasks').doc(task.id).set(task);
  }

  function toggleTaskComplete(i) {
    let task = tasks[i];
    task.isComplete = !task.isComplete;
    task.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    db.collection('tasks').doc(task.id).set(task);
  }

  async function createTask(e) {
    let newTask = {
      text: formInput,
      isComplete: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (props.contactId) {
      newTask.contactId = props.contactId;
    }

    db.collection('tasks').add(newTask);

    // Reset
    e.preventDefault();
    setFormInput('');
  }

  return (
    <div className="TaskList">
      <form onSubmit={createTask}>
        <input
          onChange={(e) => setFormInput(e.target.value)}
          value={formInput}
        />
      </form>
      <ul>
        {tasks.map((task, i) => {
          return (
            <li key={task.id} className="Task">
              <input
                type="checkbox"
                checked={task.isComplete}
                onChange={(e) => toggleTaskComplete(i)}
              />
              <TextareaAutosize
                autoFocus={true}
                name="text"
                onChange={(e) => updateTask(e, i)}
                value={task.text}
                rows={1}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TaskList;
