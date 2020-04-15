import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import TextareaAutosize from 'react-autosize-textarea';

import {
  Check as CompleteIcon,
  RadioButtonUnchecked as IncompleteIcon,
} from '@material-ui/icons';
import UIfx from 'uifx';
import firebase from 'firebase';
import db from '../firebase';
import wavFile from '../chime.wav';

function TaskList(props) {
  const [tasks, setTasks] = useState([]);
  const [formInput, setFormInput] = useState('');
  const [focusedTask, setFocusedTask] = useState(false);
  const beep = new UIfx(wavFile);

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
    // db.collection('tasks').doc(task.id).set(task);
    taskCopy[i] = task;
    setTasks(taskCopy);
  }

  function toggleTaskComplete(id) {
    let taskCopy = [...tasks];
    let i = taskCopy.findIndex((t) => t.id == id);
    let task = taskCopy[i];
    task.isComplete = !task.isComplete;

    if (task.isComplete) {
      beep.play();
    }

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

  function Task(props) {
    let { task } = props;
    if (focusedTask == task.id) {
      return (
        <li className="Task is--focused">
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
              className="button button--delete"
              onClick={(e) => deleteTask(e, task.id)}
            >
              Delete
            </button>
          </div>
        </li>
      );
    }

    return (
      <li className="Task">
        <input
          type="checkbox"
          checked={task.isComplete}
          onChange={(e) => toggleTaskComplete(task.id)}
        />
        <div className="Task__text" onClick={() => setFocusedTask(task.id)}>
          {task.text}
        </div>
      </li>
    );
  }

  let incompleteTasks = tasks.filter((t) => !t.isComplete);
  let completeTasks = tasks.filter((t) => t.isComplete);

  return (
    <div className="TaskList">
      <form onSubmit={createTask}>
        <input
          onChange={(e) => setFormInput(e.target.value)}
          value={formInput}
          placeholder="+ New Task"
        />
      </form>
      <ul className="TaskList__incomplete">
        {incompleteTasks.map((task, i) => {
          return <Task key={task.id} task={task} />;
        })}
      </ul>
      {completeTasks.length > 0 && (
        <ul className="TaskList__complete">
          {completeTasks.map((task, i) => {
            return <Task key={task.id} task={task} />;
          })}
        </ul>
      )}
    </div>
  );
}

export default TaskList;
