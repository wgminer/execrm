import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import TaskList from './TaskList';

function Tasks() {
	document.title = `Tasks | Execrm`;
	return (
		<div className="Tasks">
			<h1>Tasks</h1>
			<TaskList />
		</div>
	);
}

export default Tasks;
