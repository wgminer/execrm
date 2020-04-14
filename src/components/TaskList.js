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
  const [focusedTask, setFocusedTask] = useState(false);

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

  function updateTask(e, id) {
    let taskCopy = [...tasks];
    let i = taskCopy.findIndex((t) => t.id == id);
    let task = taskCopy[i];
    task[e.target.name] = e.target.value;
    task.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    db.collection('tasks').doc(task.id).set(task);
    taskCopy[i] = task;
    setTasks(taskCopy);
  }

  function toggleTaskComplete(id) {
    let taskCopy = [...tasks];
    let i = taskCopy.findIndex((t) => t.id == id);
    let task = taskCopy[i];
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

  function deleteTask(e, index) {
    db.collection('tasks').doc(tasks[index].id).delete();
  }

  return (
    <div className="TaskList">
      <form onSubmit={createTask}>
        <input
          onChange={(e) => setFormInput(e.target.value)}
          value={formInput}
          placeholder="+ New Task"
        />
      </form>
      <ul>
        {tasks
          .filter((t) => !t.isComplete)
          .map((task, i) => {
            if (focusedTask == task.id) {
              return (
                <li key={task.id} className="Task is--focused">
                  <input
                    type="checkbox"
                    checked={task.isComplete}
                    onChange={(e) => toggleTaskComplete(task.id)}
                  />
                  <div>
                    <TextareaAutosize
                      autoFocus={true}
                      name="text"
                      onChange={(e) => updateTask(e, task.id)}
                      onBlur={() => setFocusedTask(false)}
                      value={task.text}
                      rows={1}
                      onKeyUp={(e) => {
                        if (e.key === 'Escape') {
                          setFocusedTask(false);
                        }
                      }}
                    />
                    <button
                      className="Note__delete button button--delete"
                      onClick={(e) => deleteTask(e, task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            }

            return (
              <li key={task.id} className="Task">
                <input
                  type="checkbox"
                  checked={task.isComplete}
                  onChange={(e) => toggleTaskComplete(task.id)}
                />
                <div
                  className="Task__text"
                  onClick={() => setFocusedTask(task.id)}
                >
                  {task.text}
                </div>
              </li>
            );
          })}
      </ul>
      <ul>
        {tasks
          .filter((t) => t.isComplete)
          // .splice(0, 5)
          .map((task, i) => {
            return (
              <li key={task.id} className="Task is--complete">
                <input
                  type="checkbox"
                  checked={task.isComplete}
                  onChange={(e) => toggleTaskComplete(task.id)}
                />
                <div className="Task__text">{task.text}</div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default TaskList;
